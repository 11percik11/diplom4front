import React, { FormEvent, useRef, useState } from "react"
import styles from "./index.module.css"
import { useCreateProductMutation } from "../../app/productApi"
import { useLazyCurrentQuery } from "../../app/userApi"

export const CreateProduct: React.FC = () => {
  const [quantity, setQuantity] = useState(1)
  const [color, setColor] = useState("")
  // const [size, setSize] = useState("")
  const [sex, setSex] = useState("")
  const [model, setModel] = useState("")
  const [age, setAge] = useState("")
  const [sizesInputs, setSizesInputs] = useState([{ size: "", quantity: 1 }])
  const [sizeErrors, setSizeErrors] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});

  const [title, setTitle] = useState("")
  const [triggerCurrentQuery] = useLazyCurrentQuery()
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<string | number>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [createProduct, { isLoading, error }] = useCreateProductMutation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [variants, setVariants] = useState([
    {
      color: "",
      sizes: [{ size: "", quantity: 1 }],
      images: [] as File[],
    },
  ])

  const [sizes, setSizes] = useState<{ size: string; quantity: number }[]>([])
  const [newSize, setNewSize] = useState("")
  const [newQuantity, setNewQuantity] = useState<number>(1)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files !== null) {
      setSelectedFiles(Array.from(event.target.files)) // поддержка множественного выбора
    }
  }

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputPrice = event.target.value
    if (inputPrice === "") {
      setPrice("")
    } else if (Number(inputPrice) <= 100000000) {
      setPrice(Number(inputPrice))
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const newErrors: { [key: string]: boolean } = {};

if (!title.trim()) newErrors.title = true;
if (!description.trim()) newErrors.description = true;
if (!sex) newErrors.sex = true;
if (!model) newErrors.model = true;
if (!age) newErrors.age = true;
if (!price || Number(price) < 1) newErrors.price = true;

variants.forEach((variant, vIndex) => {
  if (!variant.color) newErrors[`variantColor-${vIndex}`] = true;
  variant.sizes.forEach((sizeEntry, sIndex) => {
    const sizeValue = Number(sizeEntry.size);
    if (!sizeEntry.size || sizeValue < 10 || sizeValue > 50) {
      newErrors[`variantSize-${vIndex}-${sIndex}`] = true;
    }
    if (!sizeEntry.quantity || sizeEntry.quantity < 1) {
      newErrors[`variantQty-${vIndex}-${sIndex}`] = true;
    }
  });
});

setFieldErrors(newErrors);

if (Object.keys(newErrors).length > 0) {
  return; // Прерываем отправку, если есть ошибки
}

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("price", price.toString())
    formData.append("sex", sex)
    formData.append("model", model)
    formData.append("age", age)

    const variantsPayload = variants.map((variant, index) => {
      return {
        color: variant.color,
        sizes: variant.sizes,
      }
    })

    formData.append("variants", JSON.stringify(variantsPayload))

    // Прикрепляем файлы по индексам: '0', '1', ...
    variants.forEach((variant, index) => {
      variant.images.forEach(file => {
        formData.append(`${index}`, file)
      })
    })

    try {
      await createProduct(formData).unwrap()
      await triggerCurrentQuery()
      // Очистка формы
      setTitle("")
      setDescription("")
      setPrice("")
      setSex("")
      setModel("")
      setAge("")
      setVariants([
        { color: "", sizes: [{ size: "", quantity: 1 }], images: [] },
      ])
    } catch (err) {
      console.error("Ошибка при создании товара", err)
    }
  }

  const allSizesValid = variants.every(variant =>
  variant.sizes.every(s =>
    Number(s.size) >= 10 && Number(s.size) <= 50
  )
)


  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.h2}>Создание товара</h2>

      <label>
        Название:
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className={`${styles.input} ${fieldErrors.title ? styles.errorInput : ''}`}
        />
      </label>

      <label>
        Описание:
        <textarea
          className={styles.textArea}
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </label>

      <label>
        Пол:
        <select
          value={sex}
          onChange={e => setSex(e.target.value)}
          required
          className={styles.input}
        >
          <option value="">Выберите пол</option>
          <option value="Мужской">Мужской</option>
          <option value="Женский">Женский</option>
          <option value="Мужской и Женский">Мужской и Женский</option>
        </select>
      </label>

      <label>
        Модель:
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          required
          className={styles.input}
        >
          <option value="">Выберите модель</option>
          {[
            "Кроссовки",
            "Кеды",
            "Туфли",
            "Ботинки",
            "Сапоги",
            "Сандали",
            "Босоножки",
            "Мокасины",
            "Балетки",
            "Сабо",
          ].map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <label>
        Возраст:
        <select
          value={age}
          onChange={e => setAge(e.target.value)}
          required
          className={styles.input}
        >
          <option value="">Выберите возраст</option>
          {["Детский", "Подростковый", "Взрослый"].map(a => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>

      <label>
        Цена:
        <input
          type="number"
          value={price}
          onChange={handlePriceChange}
          required
          min={1}
          max={100000000}
          className={`${styles.input} ${fieldErrors.title ? styles.errorInput : ''}`}
        />
      </label>

      <h3 className={styles.variantTitle}>Варианты товара:</h3>

      {variants.map((variant, variantIndex) => (
        <div key={variantIndex} className={styles.variantBlock}>
          <label>
            Цвет:
            <select
              value={variant.color}
              onChange={e => {
                const updated = [...variants]
                updated[variantIndex].color = e.target.value
                setVariants(updated)
              }}
              required
              className={styles.input}
            >
              <option value="">Выберите цвет</option>
              {[
                "Чёрный",
                "Белый",
                "Коричневый",
                "Серый",
                "Бежевый",
                "Синий",
                "Красный",
                "Бордовый",
                "Зелёный",
                "Металлик",
              ].map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.sizesWrapper}>
            <strong>Размеры:</strong>
            {variant.sizes.map((sizeEntry, sizeIndex) => (
              <div key={sizeIndex} className={styles.sizesGroup}>
                <input
                  type="number"
                  placeholder="Размер (10–50)"
                  min={10}
                  max={50}
                  step={1}
                  required
                  value={sizeEntry.size}
                  onChange={e => {
                    const updated = [...variants]
                    updated[variantIndex].sizes[sizeIndex].size = e.target.value
                    setVariants(updated)
                  }}
                  className={styles.input}
                />
                {/* {(parseInt(sizeEntry.size) < 10 ||
                  parseInt(sizeEntry.size) > 50) && (
                  <span className={styles.error}>
                    Размер должен быть от 10 до 50
                  </span>
                )} */}
                <input
                  type="number"
                  placeholder="Кол-во"
                  min={1}
                  required
                  value={sizeEntry.quantity}
                  onChange={e => {
                    const updated = [...variants]
                    updated[variantIndex].sizes[sizeIndex].quantity =
                      +e.target.value
                    setVariants(updated)
                  }}
                  className={styles.input}
                />
                {variant.sizes.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeSizeButton}
                    onClick={() => {
                      const updated = [...variants]
                      updated[variantIndex].sizes.splice(sizeIndex, 1)
                      setVariants(updated)
                    }}
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className={styles.addSizeButton}
              onClick={() => {
                const updated = [...variants]
                updated[variantIndex].sizes.push({ size: "", quantity: 1 })
                setVariants(updated)
              }}
            >
              Добавить размер
            </button>
          </div>

          <label>
            Изображения:
            <input
              type="file"
              multiple
              accept="image/*"
              required
              onChange={e => {
                if (e.target.files) {
                  const updated = [...variants]
                  updated[variantIndex].images = Array.from(e.target.files)
                  setVariants(updated)
                }
              }}
              className={styles.fileInput}
            />
          </label>

          {variants.length > 1 && (
            <button
              type="button"
              className={styles.removeVariantButton}
              onClick={() =>
                setVariants(prev => prev.filter((_, i) => i !== variantIndex))
              }
            >
              Удалить вариант
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        className={styles.addVariantButton}
        onClick={() =>
          setVariants(prev => [
            ...prev,
            { color: "", sizes: [{ size: "", quantity: 1 }], images: [] },
          ])
        }
      >
        Добавить вариант товара
      </button>

      <div className={styles.boxButton}>
        <button className={styles.button} type="submit" disabled={isLoading}>
          {isLoading ? "Добавление..." : "Добавить товар"}
        </button>
      </div>

      {error && <p className={styles.error}>Ошибка при создании товара</p>}
    </form>
  )
}

export default CreateProduct
