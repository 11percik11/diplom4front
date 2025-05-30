import { useEffect, useState } from "react"
import { useLocation, useParams } from "react-router-dom"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FaStar, FaRegStar } from "react-icons/fa"
import styles from "./index.module.css"
import { BASE_URL } from "../../constants"
import { CreateComment } from "../createComment"

import {
  useGetProductByIdQuery,
  useLazyGetProductByIdQuery,
} from "../../app/productApi"
import {
  useRateProductMutation,
  useDeleteRatingMutation,
} from "../../app/likesApi"
import { useCurrentQuery } from "../../app/userApi"
import {
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from "../../app/commentsApi"
import { useAddToCartMutation } from "../../app/cart"

export const Tovar = () => {
  const { id } = useParams<{ id: string }>()
  const token = localStorage.getItem("token")
  const { data: currentUser } = useCurrentQuery(undefined, { skip: !token })
  const { data: productData, isLoading } = useGetProductByIdQuery(id ?? "")
  const [trigger] = useLazyGetProductByIdQuery()

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [rateProduct] = useRateProductMutation()
  const [deleteRating] = useDeleteRatingMutation()
  const [addToCart] = useAddToCartMutation()
  const [deleteComment] = useDeleteCommentMutation()
  const [updateComment] = useUpdateCommentMutation()

  const [liked, setLiked] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")
  const [addedToCart, setAddedToCart] = useState(false)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const preselectedColor = params.get("color")

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const variant = productData?.variants?.[selectedVariantIndex]
  const images = variant?.images || []
  const sizes = variant?.sizes || []

  useEffect(() => {
    setSelectedSize(null) // сброс выбранного размера при смене варианта
    setCurrentImageIndex(0) // и текущей картинки, если нужно
  }, [selectedVariantIndex])

  const handlePrev = () => {
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
  }

  useEffect(() => {
    if (currentUser && id) {
      setLiked(currentUser.likes?.some(like => like.productId === id) || false)
      const rating = currentUser.likes?.find(l => l.productId === id)?.rating
      setUserRating(rating || 0)
    }
  }, [currentUser, id])

  useEffect(() => {
    if (!productData || !preselectedColor) return

    const foundIndex = productData.variants?.findIndex(
      v => v.color === preselectedColor,
    )

    if (foundIndex !== -1) {
      setSelectedVariantIndex(foundIndex)
    }
  }, [productData, preselectedColor])

  const handleRating = async (rating: number) => {
    if (!id || !currentUser) return
    try {
      if (rating === userRating) {
        await deleteRating({ productId: id }).unwrap()
        setUserRating(0)
      } else {
        await rateProduct({ productId: id, rating }).unwrap()
        setUserRating(rating)
      }
      await trigger(id)
    } catch (error) {
      console.error("Ошибка обработки рейтинга:", error)
    }
  }

  const handleAddToCart = async () => {
    if (!id || !selectedSize || !productData || !variant?.id) return

    const revertButton = () => {
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2500)
    }

    if (!currentUser) {
      const cartKey = "guest_cart"
      const existing = localStorage.getItem(cartKey)
      const guestCart: any[] = existing ? JSON.parse(existing) : []

      const existingIndex = guestCart.findIndex(
        item =>
          item.productId === id &&
          item.size === selectedSize &&
          item.variantId === variant.id,
      )

      if (existingIndex !== -1) {
        guestCart[existingIndex].quantity += 1
      } else {
        guestCart.push({
          productId: id,
          variantId: variant.id,
          size: selectedSize,
          quantity: 1,
          title: productData.title,
          description: productData.description,
          price: productData.price,
          images: images.map(img => img.url),
        })
      }

      localStorage.setItem(cartKey, JSON.stringify(guestCart))
      revertButton()
      return
    }

    try {
      await addToCart({
        productId: id,
        variantId: variant.id,
        size: selectedSize,
        quantity: 1,
      }).unwrap()
      revertButton()
    } catch (err) {
      console.error("Ошибка добавления в корзину:", err)
    }
  }

  const handleEditClick = (comment: any) => {
    setEditingCommentId(comment.id)
    setCommentText(comment.text)
    setActiveMenu(null)
  }

  const handleSaveClick = async () => {
    try {
      if (editingCommentId) {
        await updateComment({
          id: editingCommentId,
          text: commentText,
        }).unwrap()
        setEditingCommentId(null)
        await trigger(id ?? "")
      }
    } catch (error) {
      console.error("Ошибка обновления комментария:", error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment({ id: commentId }).unwrap()
      await trigger(id ?? "")
      setActiveMenu(null)
    } catch (error) {
      console.error("Ошибка удаления комментария:", error)
    }
  }

  const toggleMenu = (index: number) => {
    setActiveMenu(activeMenu === index ? null : index)
  }

  if (isLoading) return <div className={styles.loading}>Загрузка...</div>

  return (
    <div className={styles.pageContainer}>
      <div className={styles.productCard}>
        <div className={styles.imageBox}>
          {images.length > 0 ? (
            <>
              <img
                src={`${BASE_URL}${images[currentImageIndex].url}`}
                alt={`Product image ${currentImageIndex + 1}`}
                className={styles.productImage}
              />
              {images.length > 1 && (
                <>
                  <button className={styles.navButtonLeft} onClick={handlePrev}>
                    ‹
                  </button>
                  <button
                    className={styles.navButtonRight}
                    onClick={handleNext}
                  >
                    ›
                  </button>
                </>
              )}
              {images.length > 1 && (
                <div className={styles.dots}>
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`${styles.dot} ${
                        idx === currentImageIndex ? styles.activeDot : ""
                      }`}
                      onClick={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.noImage}>Нет изображений</div>
          )}
        </div>

        <div className={styles.detailsBox}>
          <div className={styles.headerRow}>
            <button
              onClick={handleAddToCart}
              className={`${styles.cartButton} ${addedToCart ? styles.added : ""}`}
            >
              {addedToCart
                ? "Добавлено ✓"
                : `В корзину — ${productData?.price} ₽`}
            </button>
          </div>

          <div className={styles.infoBlock}>
            <h2 className={styles.productTitle}>{productData?.title}</h2>
            <p>
              <strong>Описание:</strong> {productData?.description}
            </p>
            <div className={styles.colorSwitcher}>
              <strong>Цвет:</strong>
              <div className={styles.colorList}>
                {productData?.variants?.map((v, idx) => (
                  <button
                    key={idx}
                    className={`${styles.colorItem} ${
                      idx === selectedVariantIndex ? styles.selectedColor : ""
                    }`}
                    onClick={() => {
                      setSelectedVariantIndex(idx)
                      setSelectedSize(null)
                      setCurrentImageIndex(0)
                    }}
                  >
                    {v.color}
                  </button>
                ))}
              </div>
            </div>
            <p>
              <strong>Модель:</strong> {productData?.model}
            </p>
            <p>
              <strong>Возраст:</strong> {productData?.age}
            </p>
            <p>
              <strong>Пол:</strong> {productData?.sex}
            </p>

            <div className={styles.sizes}>
              <strong>Размеры:</strong>
              <div className={styles.sizeList}>
                {sizes
                  .slice()
                  .sort((a, b) => Number(a.size) - Number(b.size))
                  .map((s, i) => (
                    <button
                      type="button"
                      key={i}
                      className={`${styles.sizeItem} ${selectedSize === s.size ? styles.selected : ""} ${s.quantity === 0 ? styles.disabled : ""}`}
                      onClick={() => s.quantity > 0 && setSelectedSize(s.size)}
                      disabled={s.quantity === 0}
                    >
                      {s.size}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className={styles.ratingWrapper}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  onMouseEnter={() => currentUser && setHoverRating(star)}
                  onMouseLeave={() => currentUser && setHoverRating(0)}
                  onClick={() => currentUser && handleRating(star)}
                  style={{ opacity: currentUser ? 1 : 0.5 }}
                  title={
                    !currentUser
                      ? "Только авторизованные пользователи могут оценивать"
                      : ""
                  }
                >
                  {(hoverRating || userRating) >= star ? (
                    <FaStar color="#ffc107" size={20} />
                  ) : (
                    <FaRegStar color="#ffc107" size={20} />
                  )}
                </span>
              ))}
            </div>
            <span className={styles.ratingText}>
              {productData?.likes?.length
                ? (
                    productData.likes.reduce(
                      (sum, like) => sum + (like.rating || 0),
                      0,
                    ) / productData.likes.length
                  ).toFixed(1)
                : "0.0"}{" "}
              ({productData?.likes?.length ?? 0} оценок)
            </span>
          </div>
        </div>
      </div>

      <section className={styles.commentsSection}>
        <h3>Комментарии</h3>
        <CreateComment active={!!currentUser} />

        {productData?.comments?.length ? (
          productData.comments
            .slice()
            .reverse()
            .map((comment, index) => (
              <div className={styles.commentCard} key={index}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentUser}>
                    <img
                      src={`${BASE_URL}${comment.user.avatarUrl}`}
                      alt={comment.user.name}
                      className={styles.avatar}
                    />
                    <span>{comment.user.name}</span>
                  </div>

                  {comment.userId === currentUser?.id && (
                    <div className={styles.commentMenu}>
                      <BsThreeDotsVertical onClick={() => toggleMenu(index)} />
                      {activeMenu === index && (
                        <div className={styles.dropdown}>
                          <button onClick={() => handleEditClick(comment)}>
                            Изменить
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            Удалить
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {editingCommentId === comment.id ? (
                  <div className={styles.commentEdit}>
                    <input
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Редактировать комментарий"
                    />
                    <button onClick={handleSaveClick}>Сохранить</button>
                  </div>
                ) : (
                  <p className={styles.commentText}>{comment.text}</p>
                )}
              </div>
            ))
        ) : (
          <p>Нет комментариев</p>
        )}
      </section>
    </div>
  )
}
