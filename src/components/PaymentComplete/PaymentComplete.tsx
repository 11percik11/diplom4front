import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCreateOrderMutation } from "../../app/orders"
import styles from "./PaymentComplete.module.css"
import { FiCheckCircle } from "react-icons/fi"

const PaymentComplete = () => {
  const navigate = useNavigate()
  const [createOrder] = useCreateOrderMutation()

  useEffect(() => {
    const pending = localStorage.getItem("pendingOrder")

    if (pending) {
      const parsed = JSON.parse(pending)

      const { items, deliveryMethod, deliveryAddress } = parsed

      // Проверяем, что у всех элементов есть нужные поля
      const isValid = Array.isArray(items) && items.every(item =>
        item.productId && item.variantId && item.size && item.quantity !== undefined
      )

      if (!isValid) {
        console.warn("Неверный формат заказа в pendingOrder")
        return
      }

      console.log("Сохраняем заказ в localStorage:", {
        items,
        deliveryMethod,
        deliveryAddress,
      })

      createOrder({
        items, // [{ productId, variantId, size, quantity }]
        deliveryMethod,
        deliveryAddress,
      })
        .unwrap()
        .then(() => {
          console.log("Заказ создан после оплаты!")
          localStorage.removeItem("pendingOrder")
        })
        .catch(err => {
          console.error("Ошибка при создании заказа:", err)
        })
    }
  }, [createOrder])

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <FiCheckCircle className={styles.icon} />
        <h2>Спасибо за заказ!</h2>
        <p>Оплата прошла успешно.</p>
        <button className={styles.button} onClick={() => navigate("/")}>
          Вернуться на главную
        </button>
      </div>
    </div>
  )
}

export default PaymentComplete
