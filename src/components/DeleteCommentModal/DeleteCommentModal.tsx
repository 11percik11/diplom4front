import { useDeleteAdminCommentMutation } from '../../app/commentsApi'
import styles from './DeleteCommentModal.module.css'

interface DeleteCommentModalProps {
  productID: string
  onClose: () => void
}

const DeleteCommentModal: React.FC<DeleteCommentModalProps> = ({
  productID,
  onClose
}) => {
  const [deleteComment] = useDeleteAdminCommentMutation()

  const deleteProd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await deleteComment({ id: productID }).unwrap()
      onClose()
    } catch (error) {
      console.error('Ошибка при удалении комментария:', error)
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <span className={styles.title}>Удаление комментария</span>
        <span className={styles.closeIcon} onClick={onClose}>
          ×
        </span>
        <span className={styles.message}>
          Вы уверены, что хотите удалить комментарий?
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

export default DeleteCommentModal
