import styles from './DeleteProductModal.module.css'
import { useDeleteProductMutation } from '../../app/productApi'

interface DeleteProductModalProps {
  productID: string
  onClose: () => void
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  productID,
  onClose
}) => {
  const [deleteProduct] = useDeleteProductMutation()

  const deleteProd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await deleteProduct(productID).unwrap()
      onClose()
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <span className={styles.title}>Удаление продукта</span>
        <span className={styles.closeIcon} onClick={onClose}>
          ×
        </span>

        <span className={styles.message}>
          Вы уверены, что хотите удалить продукт?
        </span>

        <div className={styles.actions}>
          <span className={styles.deleteBtn} onClick={deleteProd}>
            Удалить
          </span>
          <span className={styles.cancelBtn} onClick={onClose}>
            Отмена
          </span>
        </div>
      </div>
    </div>
  )
}

export default DeleteProductModal
