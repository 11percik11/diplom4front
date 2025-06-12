import React, { useState, FormEvent } from "react"
import styles from "./Discount.module.css"
import { useCreateDiscountMutation } from "../../app/discount"

const CreateDiscount: React.FC = () => {
  const [target, setTarget] = useState<"product" | "variant" | "season" | "">("")
  const [value, setValue] = useState("")
  const [percentage, setPercentage] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [error, setError] = useState("")

  const [createDiscount, { isLoading }] = useCreateDiscountMutation()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!target || !value || !startsAt || !endsAt || !percentage) {
      setError("Пожалуйста, заполните все поля")
      return
    }

    const payload: any = {
      startsAt,
      endsAt,
      percentage,
    }

    if (target === "product") payload.productId = value
    if (target === "variant") payload.variantId = value
    if (target === "season") payload.season = value

    try {
      await createDiscount(payload).unwrap()

      setTarget("")
      setValue("")
      setPercentage("")
      setStartsAt("")
      setEndsAt("")
      setError("")
      alert("Скидка успешно создана")
    } catch (err) {
      console.error(err)
      setError("Ошибка при создании скидки")
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Создать скидку</h2>

      <label>
        Применить скидку к:
        <select
          className={styles.input}
          value={target}
          onChange={e => {
            setTarget(e.target.value as any)
            setValue("")
          }}
        >
          <option value="">-- Выберите --</option>
          <option value="product">Конкретному товару</option>
          <option value="variant">Варианту товара</option>
          <option value="season">Всему сезону</option>
        </select>
      </label>

      {target && (
        <label>
          {target === "product" && "ID товара:"}
          {target === "variant" && "ID варианта:"}
          {target === "season" && "Сезон:"}

          {target === "season" ? (
            <select
              className={styles.input}
              value={value}
              onChange={e => setValue(e.target.value)}
            >
              <option value="">-- Выберите сезон --</option>
              <option value="SUMMER">Лето</option>
              <option value="WINTER">Зима</option>
              <option value="ALL_SEASON">Всесезонный</option>
            </select>
          ) : (
            <input
              type="text"
              className={styles.input}
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={`Введите ${target === "product" ? "ID товара" : "ID варианта"}`}
            />
          )}
        </label>
      )}

      <label>
        Процент скидки (%):
        <input
          type="number"
          min={1}
          max={100}
          value={percentage}
          onChange={e => setPercentage(e.target.value)}
          className={styles.input}
        />
      </label>

      <label>
        Дата начала:
        <input
          type="datetime-local"
          value={startsAt}
          onChange={e => setStartsAt(e.target.value)}
          className={styles.input}
        />
      </label>

      <label>
        Дата окончания:
        <input
          type="datetime-local"
          value={endsAt}
          onChange={e => setEndsAt(e.target.value)}
          className={styles.input}
        />
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? "Создание..." : "Создать скидку"}
      </button>
    </form>
  )
}

export default CreateDiscount
