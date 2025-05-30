import React from "react"
import styles from "./index.module.css"
import { useDeleteProductMutation } from "../../app/productApi"
import { useLazyCurrentQuery } from "../../app/userApi"

export const DeleteProduct = ({ data, onClose }: any) => {
  const [trigerdeleteProduct] = useDeleteProductMutation()
  const [triggerCurrentQuery] = useLazyCurrentQuery()

  const deleteProd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await trigerdeleteProduct(data.id).unwrap()
      await triggerCurrentQuery()
      onClose()
    } catch (error) {
      console.error("Failed to update product:", error)
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <p className={styles.modalText}>Вы уверены что хотите удалить товар?</p>
        <div className={styles.boxButton}>
          <span className={styles.deleteButton} onClick={deleteProd}>
            Удалить
          </span>
          <span className={styles.cancelButton} onClick={onClose}>
            Отмена
          </span>
        </div>
      </div>
    </div>
  )
}
