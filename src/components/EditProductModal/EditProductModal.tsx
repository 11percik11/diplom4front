import React, { useState } from "react"
import { Product } from "../../app/types"
import styles from "./EditProductModal.module.css"
import { useUpdateProductMutation } from "../../app/productApi"

interface EditProductModalProps {
  product: Product
  onClose: () => void
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose }) => {
  const [title, setTitle] = useState(product.title)
  const [description, setDescription] = useState(product.description)
  const [price, setPrice] = useState<number>(product.price)
  const [quantity, setQuantity] = useState<number>(product.quantity || 1)
  const [color, setColor] = useState(product.color || "")
  const [size, setSize] = useState(product.size || "")
  const [sex, setSex] = useState(product.sex || "")
  const [model, setModel] = useState(product.model || "")
  const [age, setAge] = useState(product.age || "")
  const [avatar, setAvatar] = useState<File | null>(null)

  const [updateProduct, { isLoading }] = useUpdateProductMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("price", price.toString())
    formData.append("quantity", quantity.toString())
    formData.append("color", color)
    formData.append("size", size)
    formData.append("sex", sex)
    formData.append("model", model)
    formData.append("age", age)
    if (avatar) {
      formData.append("avatar", avatar)
    }

    try {
      await updateProduct({ userData: formData, id: product.id }).unwrap()
      onClose()
    } catch (err) {
      console.error("Ошибка при обновлении товара:", err)
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.h2}>Редактировать товар</h2>

        <label>
          Название:
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className={styles.input} />
        </label>

        <label>
          Описание:
          <textarea value={description} onChange={e => setDescription(e.target.value)} required className={styles.textArea} />
        </label>

        <div className={styles.divDisplay}>
          <label>
            Кол-во:
            <input type="number" value={quantity} min={1} onChange={e => setQuantity(Number(e.target.value))} className={styles.input} />
          </label>

          <label>
            Цвет:
            <select value={color} onChange={e => setColor(e.target.value)} required className={styles.input}>
              <option value="">Выберите цвет</option>
              {["Чёрный", "Белый", "Коричневый", "Серый", "Бежевый", "Синий", "Красный", "Бордовый", "Зелёный", "Металлик"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.divDisplay}>
          <label>
            Размер:
            <input type="number" min={1} max={50} value={size} onChange={e => setSize(e.target.value)} required className={styles.input} />
          </label>

          <label>
            Пол:
            <select value={sex} onChange={e => setSex(e.target.value)} required className={styles.input}>
              <option value="">Выберите пол</option>
              <option value="Мужской">Мужской</option>
              <option value="Женский">Женский</option>
              <option value="Мужской и Женский">Мужской и Женский</option>
            </select>
          </label>
        </div>

        <div className={styles.divDisplay}>
          <label>
            Модель:
            <select value={model} onChange={e => setModel(e.target.value)} required className={styles.input}>
              <option value="">Выберите модель</option>
              {["Кроссовки", "Кеды", "Туфли", "Ботинки", "Сапоги", "Сандалии", "Босоножки", "Мокасины", "Балетки", "Сабо"].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>

          <label>
            Возраст:
            <select value={age} onChange={e => setAge(e.target.value)} required className={styles.input}>
              <option value="">Выберите возраст</option>
              {["Детский", "Подростковый", "Взрослый"].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.divDisplay}>
          <label>
            Цена:
            <input type="number" min={1} max={100000000} value={price} onChange={e => setPrice(Number(e.target.value))} className={styles.input} />
          </label>

          <label>
            Фото:
            <input type="file" onChange={e => setAvatar(e.target.files?.[0] || null)} accept="image/*" className={styles.fileInput} />
          </label>
        </div>

        <div className={styles.boxButton}>
          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Сохранение..." : "Сохранить"}
          </button>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditProductModal
