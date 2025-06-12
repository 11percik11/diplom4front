import React from "react";
import styles from "./index.module.css";
import { BASE_URL } from "../../constants";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }: any) => {
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = React.useState(false);

  const goToProduct = () => {
    const variantColor = product.variants?.[0]?.color;
    navigate(`/product/${product.id}?color=${encodeURIComponent(variantColor)}`);
  };

  const now = new Date();

  // Найти отображаемый вариант
  const displayedVariant =
    product.variants?.find((v: any) => v.visible) || product.variants?.[0];

  const firstImage = displayedVariant?.images?.[0]?.url;

  // Получить все активные скидки товара
  const productDiscounts = product.discounts?.filter(
    (d: any) =>
      new Date(d.startsAt) <= now && new Date(d.endsAt) >= now
  ) || [];

  // Получить все активные скидки варианта
  const variantDiscounts = displayedVariant?.discounts?.filter(
    (d: any) =>
      new Date(d.startsAt) <= now && new Date(d.endsAt) >= now
  ) || [];

  // Объединить и выбрать наибольшую скидку
  const allDiscounts = [...productDiscounts, ...variantDiscounts];
  const bestDiscount = allDiscounts.reduce(
    (max, d) => (d.percentage > max.percentage ? d : max),
    { percentage: 0 }
  );

  const discountPercent = bestDiscount?.percentage || 0;
  const hasDiscount = discountPercent > 0;

  const discountedPrice = hasDiscount
    ? Math.floor(product.price * (1 - discountPercent / 100))
    : product.price;

  const commentCount =
    product.comments?.filter((comment: any) => comment.visible)?.length || 0;

  const averageRating = React.useMemo(() => {
    if (!product.likes?.length) return null;
    const sum = product.likes.reduce(
      (acc: number, like: any) => acc + like.rating,
      0
    );
    return (sum / product.likes.length).toFixed(1);
  }, [product.likes]);

  return (
    <div className={styles.card}>
      <div className={styles.imageBox} onClick={goToProduct}>
        {firstImage ? (
          <img
            className={styles.productImage}
            src={`${BASE_URL}${firstImage}`}
            alt={product.title}
          />
        ) : (
          <div className={styles.noImage}>Нет изображения</div>
        )}

        {hasDiscount && (
          <div className={styles.discountBadge}>-{discountPercent}%</div>
        )}
      </div>

      <div className={styles.titleButton} onClick={goToProduct}>
        <h3 className={styles.title}>{product.title}</h3>
      </div>

      <div className={styles.details}>
        <div className={styles.priceSection}>
          {hasDiscount ? (
            <>
              <div className={styles.discountedPrice}>{discountedPrice} ₽</div>
              <div className={styles.oldPrice}>{product.price} ₽</div>
            </>
          ) : (
            <div className={styles.priceText}>{product.price} ₽</div>
          )}
        </div>

        <p className={styles.description}>{product.description}</p>

        <div className={styles.meta}>
          <span>💬 {commentCount}</span>
          {averageRating !== null && <span>⭐ {averageRating}</span>}
        </div>
      </div>

      <button
        className={`${styles.cartButton} ${isAdded ? styles.added : ""}`}
        onClick={goToProduct}
        disabled={isAdded}
      >
        {isAdded ? "Товар добавлен в корзину" : "Посмотреть товар"}
      </button>
    </div>
  );
};

export default ProductCard;
