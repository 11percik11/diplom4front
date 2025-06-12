import { useEffect, useState } from "react"
import {
  useGetAllOrdersQuery,
  useUpdateOrderIsGivenToClientMutation,
  useUpdateOrderIsReadyMutation,
} from "../../app/orders"
import styles from "./ManageOrdersPage.module.css"
import { Order } from "../../app/types"

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const ManageOrdersPage = () => {
  const { data: fetchedOrders, isLoading, isError } = useGetAllOrdersQuery()
  const [updateIsReady] = useUpdateOrderIsReadyMutation()
  const [updateIsGiven] = useUpdateOrderIsGivenToClientMutation()
  const [orders, setOrders] = useState<Order[]>([])
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  const [filterReady, setFilterReady] = useState<"all" | "ready" | "notReady">("all")
  const [filterGiven, setFilterGiven] = useState<"all" | "given" | "notGiven">("all")

  useEffect(() => {
    if (fetchedOrders) setOrders(fetchedOrders)
  }, [fetchedOrders])

  const toggleIsReady = async (orderId: string, current: boolean) => {
    try {
      const response = await updateIsReady({ orderId, isReady: !current }).unwrap()
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, isReady: response.isReady } : order
        )
      )
    } catch (error) {
      console.error("Ошибка при обновлении isReady", error)
    }
  }

  const toggleIsGivenToClient = async (orderId: string, current: boolean) => {
    try {
      const response = await updateIsGiven({ orderId, isGivenToClient: !current }).unwrap()
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, isGivenToClient: response.isGivenToClient } : order
        )
      )
    } catch (error) {
      console.error("Ошибка при обновлении isGivenToClient", error)
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedOrderId(prev => (prev === id ? null : id))
  }

  const filteredOrders = orders.filter(order => {
    if (filterReady === "ready" && !order.isReady) return false
    if (filterReady === "notReady" && order.isReady) return false
    if (filterGiven === "given" && !order.isGivenToClient) return false
    if (filterGiven === "notGiven" && order.isGivenToClient) return false
    return true
  })

  if (isLoading) return <p>Загрузка заказов...</p>
  if (isError) return <p>Ошибка при загрузке заказов</p>

  return (
    <div className={styles.container}>
      <h2>Управление заказами</h2>

      <div className={styles.filters}>
        <label>
          Готовность:
          <select value={filterReady} onChange={e => setFilterReady(e.target.value as any)}>
            <option value="all">Все</option>
            <option value="ready">Готовые</option>
            <option value="notReady">Не готовые</option>
          </select>
        </label>

        <label>
          Статус передачи:
          <select value={filterGiven} onChange={e => setFilterGiven(e.target.value as any)}>
            <option value="all">Все</option>
            <option value="given">Отданные</option>
            <option value="notGiven">Не отданные</option>
          </select>
        </label>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Пользователь</th>
            <th>Дата</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Готов</th>
            <th>Отдан</th>
            <th>Подробнее</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <>
              <tr key={order.id}>
                <td>{order.user?.email || "—"}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.totalPrice}₽</td>
                <td>{order.status}</td>
                <td>
                  <button
                    className={order.isReady ? styles.ready : styles.notReady}
                    onClick={() => toggleIsReady(order.id, order.isReady)}
                  >
                    {order.isReady ? "✓" : "✗"}
                  </button>
                </td>
                <td>
                  <button
                    className={order.isGivenToClient ? styles.given : styles.notGiven}
                    onClick={() => toggleIsGivenToClient(order.id, order.isGivenToClient)}
                  >
                    {order.isGivenToClient ? "✓" : "✗"}
                  </button>
                </td>
                <td>
                  <button onClick={() => toggleExpanded(order.id)}>
                    {expandedOrderId === order.id ? "Скрыть" : "Показать"}
                  </button>
                </td>
              </tr>

              {expandedOrderId === order.id && (
                <tr key={`${order.id}-details`}>
                  <td colSpan={7}>
                    <div className={styles.detailsBox}>
                      <p><strong>Способ доставки:</strong> {order.deliveryMethod  == "pickup" ? "Самовывоз" : "Курьер"}</p>
                      {order.deliveryAddress && (
                        <p><strong>Адрес:</strong> {order.deliveryAddress}</p>
                      )}
                      <p><strong>Контакт:</strong> {order.user?.name} | {order.user?.email}</p>
                      {order.user?.phone && (
                        <p><strong>Телефон:</strong> {order.user.phone}</p>
                      )}
                      <p><strong>Товары:</strong></p>
                      <ul className={styles.productList}>
                        {order.items.map(item => (
                          <li key={item.id} className={styles.productItem}>
                            <img
                              src={
                                item.variant?.images?.[0]?.url
                                  ? `${BASE_URL}${item.variant.images[0].url}`
                                  : "/placeholder.jpg"
                              }
                              alt={item.productTitle}
                              className={styles.productImage}
                            />
                            <div>
                              <strong>{item.productTitle}</strong><br />
                              Модель: {item.productModel}<br />
                              Цвет: {item.variantColor}<br />
                              Размер: {item.size}, Кол-во: {item.quantity}, Цена: {item.productPrice}₽
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ManageOrdersPage
