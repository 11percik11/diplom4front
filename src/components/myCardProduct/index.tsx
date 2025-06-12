import React, { useState } from "react"
import styles from "./index.module.css"
import { BASE_URL } from "../../constants"
import { useNavigate } from "react-router-dom"
import EditProduct from "../editProduct"
import { DeleteProduct } from "../deleteProduct"

interface MyProductProps {
  refetch: () => void;
  product: any;
}

const MyProductCard = ({ product, refetch }: MyProductProps) => {
  const [isModalOpen, setModalOpen] = useState(false)
  const [isModalDelete, setModalDelete] = useState(false)
  const navigate = useNavigate()

  const prodId = () => {
    navigate(`/product/${product.id}`)
  }

  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageContainer} onClick={prodId}>
          {product.variants?.[0]?.images?.[0]?.url ? (
            <img
              src={`${BASE_URL}${product.variants[0].images[0].url}`}
              alt={product.title}
              className={styles.productImage}
            />
          ) : (
            <div className={styles.imagePlaceholder}>Нет изображения</div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.title} onClick={prodId}>
            {product.title}
          </div>

          <p className={styles.description}>{product.description}</p>
          <div className={styles.price}>{product.price} ₽</div>

          <div className={styles.buttonGroup}>
            <button
              onClick={() => setModalOpen(true)}
              className={`${styles.actionBtn} ${styles.editBtn}`}
            >
              Изменить
            </button>
            <button
              onClick={() => setModalDelete(true)}
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
            >
              Удалить
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EditProduct refetch={refetch} data={product} onClose={() => setModalOpen(false)} />
      )}
      {isModalDelete && (
        <DeleteProduct refetch={refetch} data={product} onClose={() => setModalDelete(false)} />
      )}
    </>
  )
}

export default MyProductCard
