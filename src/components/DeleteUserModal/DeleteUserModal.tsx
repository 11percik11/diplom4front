import { useDeleteUserMutation } from '../../app/userApi'
import styles from './DeleteUserModal.module.css'

interface DeleteUserModalProps {
  productID: string
  onClose: () => void
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  productID,
  onClose
}) => {
  const [deleteUser] = useDeleteUserMutation()

  const deleteUserHandler = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await deleteUser({ id: productID }).unwrap()
      onClose()
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error)
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <span className={styles.title}>Удаление пользователя</span>
        <span className={styles.closeIcon} onClick={onClose}>
          ×
        </span>

        <span className={styles.message}>
          Вы уверены, что хотите удалить пользователя?
        </span>

        <div className={styles.actions}>
          <span className={styles.deleteBtn} onClick={deleteUserHandler}>
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

export default DeleteUserModal
