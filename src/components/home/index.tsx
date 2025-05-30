import React, { useEffect, useState } from "react"
import styles from "./index.module.css"
import { useGetAllProductQuery } from "../../app/productApi"
import ProductCard from "../cardProduct"
import { useDispatch } from "react-redux"
import { setProducts } from "../productSlice"
import { useDebounce } from "./ui/useDebounce/useDebounce"

const Home: React.FC = () => {
  const dispatch = useDispatch()

  const [filters, setFilters] = useState<Record<string, string>>({})
  const [category, setCategory] = useState("")

  const debouncedFilters = useDebounce(
    {
      ...filters,
      search: localStorage.getItem("searchQuery") || "",
    },
    500,
  )

  const { data, isSuccess, isLoading } = useGetAllProductQuery(debouncedFilters)

  useEffect(() => {
    if (isSuccess) {
      dispatch(setProducts(data.map((p: any) => p.product ?? p)))
    }
  }, [isSuccess, data, dispatch])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target

    setFilters(prev => {
      const updated = {
        ...prev,
        [name]: value,
      }

      // ❗️Если пользователь вручную меняет sex или age — убираем активную категорию
      if ((name === "sex" || name === "age") && category === prev[name]) {
        setCategory("") // Сброс активной кнопки
      }

      return updated
    })
  }

  const handleClear = () => {
    setFilters({})
    localStorage.removeItem("searchQuery")
    setCategory("")
  }

  const handleCategoryClick = (field: "sex" | "age", value: string) => {
    setCategory(prev => (prev === value ? "" : value))
    setFilters(prev => {
      const updated = { ...prev, sex: "", age: "" }
      updated[field] = prev[field] === value ? "" : value
      return updated
    })
  }

  return (
    <div className={styles.layout}>
      <div className={styles.mainContent}>
        <div className={styles.categoryTabs}>
          {[
            { label: "Для мужчин", field: "sex" as const, value: "Мужской" },
            { label: "Для женщин", field: "sex" as const, value: "Женский" },
            { label: "Детский", field: "age" as const, value: "Детский" },
            {
              label: "Подростковый",
              field: "age" as const,
              value: "Подростковый",
            },
            { label: "Взрослый", field: "age" as const, value: "Взрослый" },
          ].map(({ label, field, value }) => (
            <button
              key={label}
              className={`${styles.tabButton} ${category === value ? styles.active : ""}`}
              onClick={() => handleCategoryClick(field, value)} // field точно "sex" | "age"
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.productList}>
          {isLoading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : data?.length ? (
            data.map((entry: any) => {
              const product = entry.product ?? entry
              return <ProductCard key={product.id} product={product} />
            })
          ) : (
            <p>Нет товара</p>
          )}
        </div>
      </div>

      <div className={styles.filterSidebar}>
        <h3>Фильтры</h3>

        <div className={styles.filterGroup}>
          <label>Цена (от):</label>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice || ""}
            onChange={handleChange}
          />
          <label>до:</label>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice || ""}
            onChange={handleChange}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Цвет:</label>
          <select
            name="color"
            value={filters.color || ""}
            onChange={handleChange}
          >
            <option value="">Любой</option>
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
        </div>

        <div className={styles.filterGroup}>
          <label>Размер от:</label>
          <input
            type="number"
            name="minSize"
            value={filters.minSize || ""}
            onChange={handleChange}
          />
          <label>до:</label>
          <input
            type="number"
            name="maxSize"
            value={filters.maxSize || ""}
            onChange={handleChange}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Пол:</label>
          <select name="sex" value={filters.sex || ""} onChange={handleChange}>
            <option value="">Любой</option>
            <option value="Мужской">Мужской</option>
            <option value="Женский">Женский</option>
            <option value="Мужской и Женский">Мужской и Женский</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Модель:</label>
          <select
            name="model"
            value={filters.model || ""}
            onChange={handleChange}
          >
            <option value="">Любая</option>
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
        </div>

        <div className={styles.filterGroup}>
          <label>Возраст:</label>
          <select name="age" value={filters.age || ""} onChange={handleChange}>
            <option value="">Любой</option>
            {["Детский", "Подростковый", "Взрослый"].map(a => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <button className={styles.clearBtn} onClick={handleClear}>
          Сбросить фильтры
        </button>
      </div>
    </div>
  )
}

export default Home
