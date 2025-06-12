import React, { useState } from "react"
import styles from "./OrdersPage.module.css"
import { useGetMyOrdersQuery } from "../../app/orders"
import { BASE_URL } from "../../constants"

export default function OrdersPage() {
  const { data: orders, isLoading } = useGetMyOrdersQuery()
  const [openOrderIds, setOpenOrderIds] = useState<string[]>([])

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const toggleOrder = (orderId: string) => {
    setOpenOrderIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId],
    )
  }

  const filterOrdersByDate = () => {
    if (!orders) return []

    return orders.filter(order => {
      const createdAt = new Date(order.createdAt)
      const afterStart = startDate ? createdAt >= new Date(startDate) : true
      const beforeEnd = endDate ? createdAt <= new Date(endDate) : true
      return afterStart && beforeEnd
    })
  }

  const filteredOrders = filterOrdersByDate()

  if (isLoading) {
    return <div className={styles.loading}>Загрузка заказов...</div>
  }

  return (
    <div className={styles.ordersContainer}>
      <h2>Мои заказы</h2>

      <div className={styles.filterRow}>
        <div className={styles.filterContainer}>
          <label>
            От:
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </label>
          <label>
            До:
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </label>
        </div>

        <button
          className={`${styles.resetButton} ${
            startDate || endDate ? styles.active : ""
          }`}
          onClick={() => {
            setStartDate("")
            setEndDate("")
          }}
        >
          Сбросить фильтр
        </button>
      </div>

      {filteredOrders.map(order => (
        <div key={order.id} className={styles.orderCard}>
          <div
            className={styles.orderHeader}
            onClick={() => toggleOrder(order.id)}
          >
            <div>
              <strong>Заказ от:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </div>
            <div>
              <strong>Сумма:</strong> {order.totalPrice} ₽
            </div>
            <button className={styles.toggleButton}>
              {openOrderIds.includes(order.id) ? "Скрыть" : "Показать товары"}
            </button>
          </div>

          {openOrderIds.includes(order.id) && (
            <div className={styles.itemsList}>
              {order.items.map(item => (
                <div key={item.id} className={styles.item}>
                  <img
                    src={`${BASE_URL}${item.variant?.images?.[0]?.url ?? ""}`}
                    alt={item.product.title}
                    className={styles.itemImage}
                  />
                  <div className={styles.itemDetails}>
                    <div className={styles.itemTitle}>{item.product.title}</div>
                    <div>Цена: {item.productPrice} ₽</div>
                    <div>Количество: {item.quantity}</div>
                    <div>Размер: {item.size}</div>
                  </div>
                  <a
                    href={`/product/${item.productId}?color=${encodeURIComponent(item.variant.color)}`}
                    className={styles.productLink}
                  >
                    Перейти к товару
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
