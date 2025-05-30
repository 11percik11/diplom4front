import React, { useState, FormEvent } from "react";
import styles from "./index.module.css";
import { useUpdateProductMutation } from "../../app/productApi";
import { useLazyCurrentQuery } from "../../app/userApi";
import { BASE_URL } from "../../constants";

interface SizeEntry {
  size: string;
  quantity: number;
}

interface ExistingImage {
  id: string;
  url: string;
}

interface Variant {
  id?: string;
  color: string;
  sizes: SizeEntry[];
  existingImages: ExistingImage[];
  images: File[];
  imagesToRemove: string[];
}

interface EditProductProps {
  data: {
    id: string;
    title: string;
    description: string;
    price: number | string;
    sex: string;
    model: string;
    age: string;
    variants: {
      id?: string;
      color: string;
      sizes: SizeEntry[];
      images: ExistingImage[];
    }[];
  };
  onClose: () => void;
}

const EditProduct: React.FC<EditProductProps> = ({ data, onClose }) => {
  const [title, setTitle] = useState(data.title || "");
  const [description, setDescription] = useState(data.description || "");
  const [price, setPrice] = useState<string | number>(data.price || "");
  const [sex, setSex] = useState(data.sex || "");
  const [model, setModel] = useState(data.model || "");
  const [age, setAge] = useState(data.age || "");

  const [variants, setVariants] = useState<Variant[]>(
    data.variants?.map((v) => ({
      id: v.id,
      color: v.color || "",
      sizes:
        v.sizes?.map((s) => ({
          size: s.size || "",
          quantity: s.quantity || 1,
        })) || [{ size: "", quantity: 1 }],
      existingImages: v.images || [],
      images: [],
      imagesToRemove: [],
    })) || [
      {
        color: "",
        sizes: [{ size: "", quantity: 1 }],
        existingImages: [],
        images: [],
        imagesToRemove: [],
      },
    ]
  );

  const [updateProduct] = useUpdateProductMutation();
  const [triggerCurrentQuery] = useLazyCurrentQuery();

  const [colorErrors, setColorErrors] = useState<boolean[]>(
    new Array(variants.length).fill(false)
  );

  // Новое состояние для ошибок размеров
  const [sizeErrors, setSizeErrors] = useState<boolean[][]>(
    variants.map((v) => new Array(v.sizes.length).fill(false))
  );

  const [formError, setFormError] = useState<string>("");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputPrice = e.target.value;
    if (inputPrice === "") {
      setPrice("");
    } else if (Number(inputPrice) <= 100000000) {
      setPrice(Number(inputPrice));
    }
  };

  // Удаляем существующее изображение
  const handleRemoveExistingImage = (variantIndex: number, imageId: string) => {
    const updated = [...variants];
    const variant = updated[variantIndex];

    if (!variant.imagesToRemove.includes(imageId)) {
      variant.imagesToRemove.push(imageId);
    }

    variant.existingImages = variant.existingImages.filter(
      (img) => img.id !== imageId
    );

    setVariants(updated);
  };

  // Добавляем новые файлы
  const handleAddNewImages = (variantIndex: number, files: FileList) => {
    const updated = [...variants];
    updated[variantIndex].images = updated[variantIndex].images.concat(
      Array.from(files)
    );
    setVariants(updated);
  };

  // Проверка уникальности цвета при изменении + обновление ошибок
  const handleColorChange = (variantIndex: number, newColor: string) => {
    const updated = [...variants];
    updated[variantIndex].color = newColor;

    setVariants(updated);

    // Проверяем дубликаты цветов
    const colors = updated.map((v) => v.color.trim().toLowerCase());
    const errors = colors.map((color) => {
      if (color === "") return false;
      return colors.filter((c) => c === color).length > 1;
    });
    setColorErrors(errors);
  };

  // Функция проверки дубликатов размеров в каждом варианте
  const validateSizes = (variantsToValidate: Variant[]) => {
    const newSizeErrors = variantsToValidate.map((variant) => {
      const sizes = variant.sizes.map((s) => s.size.trim());
      return sizes.map((size) => {
        if (size === "") return false;
        return sizes.filter((s) => s === size).length > 1;
      });
    });
    setSizeErrors(newSizeErrors);
    return newSizeErrors.some((errors) => errors.some((e) => e));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (Number(price) > 100000000) {
      setFormError("Цена не может быть больше 100 000 000 ₽");
      return;
    }

    if (colorErrors.some((err) => err)) {
      setFormError("Цвета вариантов должны быть уникальными");
      return;
    }

    if (variants.some((v) => v.color.trim() === "")) {
      setFormError("Все варианты должны иметь выбранный цвет");
      return;
    }

    // Проверка на дублирующиеся размеры
    if (validateSizes(variants)) {
      setFormError("Вариант не может содержать одинаковые размеры");
      return;
    }

    setFormError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price.toString());
    formData.append("sex", sex);
    formData.append("model", model);
    formData.append("age", age);

    const variantsPayload = variants.map((v) => ({
      id: v.id,
      color: v.color,
      sizes: v.sizes,
      existingImages: v.existingImages,
      imagesToRemove: v.imagesToRemove,
    }));

    formData.append("variants", JSON.stringify(variantsPayload));

    variants.forEach((variant, i) => {
      variant.images.forEach((file) => {
        formData.append(`${i}`, file);
      });
    });

    try {
      await updateProduct({ userData: formData, id: data.id }).unwrap();
      await triggerCurrentQuery();
      alert("Товар обновлён");
      onClose();
    } catch (err) {
      console.error("Ошибка при обновлении товара:", err);
      alert("Ошибка при обновлении товара");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.h2}>Редактировать товар</h2>

        {/* Основные поля */}
        <div className={styles.sectionGroup}>
          <label>
            Название:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={styles.input}
            />
          </label>

          <label>
            Описание:
            <textarea
              className={styles.textArea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>
        </div>

        <div className={styles.sectionGroup}>
          <label>
            Пол:
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
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
              onChange={(e) => setModel(e.target.value)}
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
                "Сандалии",
                "Босоножки",
                "Мокасины",
                "Балетки",
                "Сабо",
              ].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.sectionGroup}>
          <label>
            Возраст:
            <select
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className={styles.input}
            >
              <option value="">Выберите возраст</option>
              {["Детский", "Подростковый", "Взрослый"].map((a) => (
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
              className={styles.input}
            />
          </label>
        </div>

        {/* Варианты */}
        <h3 style={{ marginTop: 24, marginBottom: 16 }}>Варианты товара</h3>

        {variants.map((variant, variantIndex) => (
          <div key={variantIndex} className={styles.variantCard}>
            <div className={styles.variantHeader}>
              <h4>Вариант #{variantIndex + 1}</h4>
              <button
                type="button"
                className={styles.removeVariantButton}
                onClick={() =>
                  setVariants((prev) =>
                    prev.filter((_, idx) => idx !== variantIndex)
                  )
                }
                title="Удалить вариант"
              >
                ✖
              </button>
            </div>

            <label>
              Цвет:
              <select
                value={variant.color}
                onChange={(e) =>
                  handleColorChange(variantIndex, e.target.value)
                }
                required
                className={`${styles.input} ${
                  colorErrors[variantIndex] ? styles.inputError : ""
                }`}
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
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <strong>Размеры и количество:</strong>
              <table className={styles.sizesTable}>
                <thead>
                  <tr>
                    <th>Размер</th>
                    <th>Количество</th>
                    <th>Удалить</th>
                  </tr>
                </thead>
                <tbody>
                  {variant.sizes.map((sizeEntry, sizeIndex) => (
                    <tr key={sizeIndex}>
                      <td>
                        <input
                          type="number"
                          min={10}
                          max={50}
                          value={sizeEntry.size}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[variantIndex].sizes[sizeIndex].size =
                              e.target.value;
                            setVariants(updated);
                            validateSizes(updated);
                          }}
                          className={`${styles.sizeInput} ${
                            sizeErrors[variantIndex]?.[sizeIndex]
                              ? styles.inputError
                              : ""
                          }`}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          value={sizeEntry.quantity}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[variantIndex].sizes[sizeIndex].quantity =
                              +e.target.value;
                            setVariants(updated);
                          }}
                          className={styles.quantityInput}
                          required
                        />
                      </td>
                      <td>
                        {variant.sizes.length > 1 && (
                          <button
                            type="button"
                            className={styles.removeSizeButton}
                            onClick={() => {
                              const updated = [...variants];
                              updated[variantIndex].sizes.splice(sizeIndex, 1);
                              setVariants(updated);
                              validateSizes(updated);
                            }}
                            title="Удалить размер"
                          >
                            ✖
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                className={styles.addSizeButton}
                onClick={() => {
                  const updated = [...variants];
                  updated[variantIndex].sizes.push({ size: "", quantity: 1 });
                  setVariants(updated);
                  validateSizes(updated);
                }}
              >
                Добавить размер
              </button>
            </div>

            {/* Секция с изображениями */}
            <div className={styles.imagesSection}>
              <strong>Существующие изображения:</strong>
              <div className={styles.existingImagesWrapper}>
                {variant.existingImages.map((img) => (
                  <div key={img.id} className={styles.imageWrapper}>
                    <img
                      src={`${BASE_URL}${img.url}`}
                      alt="variant"
                      className={styles.imagePreview}
                    />
                    <button
                      type="button"
                      className={styles.removeImageButton}
                      onClick={() =>
                        handleRemoveExistingImage(variantIndex, img.id)
                      }
                      title="Удалить изображение"
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>

              <label>
                Добавить новые изображения:
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleAddNewImages(variantIndex, e.target.files);
                    }
                  }}
                  className={styles.fileInput}
                />
              </label>
            </div>
          </div>
        ))}

        <button
          type="button"
          className={styles.addVariantButton}
          onClick={() =>
            setVariants((prev) => [
              ...prev,
              {
                color: "",
                sizes: [{ size: "", quantity: 1 }],
                existingImages: [],
                images: [],
                imagesToRemove: [],
              },
            ])
          }
        >
          Добавить вариант
        </button>

        {/* Ошибка внизу формы */}
        {formError && <div className={styles.formError}>{formError}</div>}

        <div className={styles.boxButton}>
          <button type="submit" className={styles.button}>
            Сохранить изменения
          </button>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
