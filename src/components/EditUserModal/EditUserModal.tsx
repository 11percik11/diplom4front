import React, { useRef, useState } from "react"
import { User } from "../../app/types"
import styles from "./EditUserModal.module.css"
import { useUpdateRoleMutation } from "../../app/userApi"

interface EditUserModalProps {
  product: User
  onClose: () => void
}

const EditUserModal: React.FC<EditUserModalProps> = ({ product, onClose }) => {
  const formRef = useRef<HTMLFormElement>(null)
  const [updateUserRole, { isLoading }] = useUpdateRoleMutation()
  const [fileName, setFileName] = useState("")
  const [isActivated, setIsActivated] = useState(product.isActivated)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formRef.current) return

    console.log(isActivated)
    const formData = new FormData(formRef.current)
    formData.append("id", product.id.toString())
    formData.delete("isActivated"); // удалить старое значение, если есть
    formData.append("isActivated", isActivated.toString());
    try {
      await updateUserRole({
        userData: formData,
        // id: product.id
      }).unwrap()
      onClose()
    } catch (error) {
      console.error("Failed to update product:", error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name)
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.editProduct}>
        <div className={styles.header}>
          <h2>Edit Product</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={styles.editProduct__form}
        >
          <div className={styles.formGroup}>
            <label className={styles.label}>Имя</label>
            <input
              type="text"
              name="name"
              className={styles.input}
              defaultValue={product.name}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Аккаунт активирован?</label>
            <select
              name="isActivated"
              className={styles.input}
              value={isActivated ? "true" : "false"}
              onChange={e => setIsActivated(e.target.value === "true")}
            >
              <option value="true">Да</option>
              <option value="false">Нет</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Роль</label>
            <select
              name="role"
              className={styles.input}
              defaultValue={product.role}
              required
            >
              <option value="CLIENT">CLIENT</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Телефон</label>
            <input
              type="number"
              name="phone"
              className={styles.input}
              defaultValue={product.phone}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Аватар</label>
            <div className={styles.fileInputWrapper}>
              <label className={styles.fileInputLabel}>
                Выберите файл
                <input
                  type="file"
                  name="avatar"
                  onChange={handleFileChange}
                  accept="image/*"
                  className={styles.fileInput}
                />
              </label>
              <span className={styles.fileName}>
                {fileName || "Нет файла"}
              </span>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.loadingText}>Сохранение...</span>
              ) : (
                "Сохранить изменения"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditUserModal
