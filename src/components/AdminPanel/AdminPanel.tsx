import { useState, useEffect } from "react"
import { useGetAllUserQuery } from "../../app/userApi"
// import { useGetAllProductQuery } from "../../app/productApi"
import { useAllCommentMutation } from "../../app/commentsApi"
import styles from "./AdminPanel.module.css"
import { ActionsMenu } from "../ActionsMenu/ActionsMenu"
import EditProductModal from "../EditProductModal/EditProductModal"
import { BASE_URL } from "../../constants"
import DeleteProductModal from "../DeleteProductModal/DeleteProductModal"
import DeleteCommentModal from "../DeleteCommentModal/DeleteCommentModal"
import DeleteUserModal from "../DeleteUserModal/DeleteUserModal"
import EditUserModal from "../EditUserModal/EditUserModal"
import { useGetAllProductQuery } from "../../app/productApi"
import { useGetAllOrdersQuery } from "../../app/orders"

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<
    "users" | "products" | "comments" | "orders"
  >("users")
  

  const [inputProductId, setInputProductId] = useState("")

  // Добавляем refetch для пользователей и продуктов
  const {
    data: users = [],
    isLoading: isUsersLoading,
    refetch: refetchUsers,
  } = useGetAllUserQuery()
  const {
    data: products = [],
    isLoading: isProductsLoading,
    refetch: refetchProducts,
  } = useGetAllProductQuery({})
  const [fetchComments, { data: comments = [], isLoading: isCommentsLoading }] =
    useAllCommentMutation()

  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const editingProduct = products.find(
    (p: any) => p.product.id === editingProductId,
  )?.product

  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null)

  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

  console.log("Users data:", users)
  const editingUser = users.find((user: any) => user.id === editingUserId)

  // Эффект для автоматического обновления данных при изменении активной вкладки
  useEffect(() => {
    if (activeTab === "users") {
      refetchUsers()
    } else if (activeTab === "products") {
      refetchProducts()
    }
    // Если активна вкладка комментариев, не делаем автоматического обновления
  }, [activeTab, refetchUsers, refetchProducts])

  const handleTabChange = (tab: "users" | "products" | "comments" | "orders") => {
    setActiveTab(tab)
  }

  const { data: orders = [], isLoading: isOrdersLoading } =
    useGetAllOrdersQuery()

  const handleFetchComments = () => {
    if (inputProductId.trim()) {
      fetchComments({ productid: inputProductId })
    }
  }

  // Функции для обновления данных после модальных операций
  const handleProductUpdated = () => {
    setEditingProductId(null)
    refetchProducts()
  }

  const handleProductDeleted = () => {
    setDeleteProductId(null)
    refetchProducts()
  }

  const handleCommentDeleted = () => {
    setDeleteCommentId(null)
    if (inputProductId.trim()) {
      fetchComments({ productid: inputProductId })
    }
  }

  const handleUserUpdated = () => {
    setEditingUserId(null)
    refetchUsers()
  }

  const handleUserDeleted = () => {
    setDeleteUserId(null)
    refetchUsers()
  }

  return (
    <div className={styles.adminPanel}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "users" ? styles.active : ""}`}
          onClick={() => handleTabChange("users")}
        >
          Пользователи
        </button>
        <button
          className={`${styles.tab} ${activeTab === "products" ? styles.active : ""}`}
          onClick={() => handleTabChange("products")}
        >
          Товар
        </button>
        <button
          className={`${styles.tab} ${activeTab === "comments" ? styles.active : ""}`}
          onClick={() => handleTabChange("comments")}
        >
          Комментарии
        </button>
        <button
          className={`${styles.tab} ${activeTab === "orders" ? styles.active : ""}`}
          onClick={() => handleTabChange("orders")}
        >
          Заказы
        </button>
      </div>
      <div className={styles.tabContent}>
        {activeTab === "users" && (
          <div>
            <h2>Пользователи</h2>
            {isUsersLoading ? (
              <p>Загрузка...</p>
            ) : (
              <div className={styles.tableWrapper}>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Имя</th>
                    <th>Почта</th>
                    <th>Телефон</th>
                    <th>Роль</th>
                    <th>Количество продукта</th>
                    <th>Комментарии</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td data-label="Email">{user.email}</td>
                      <td>{user.phone || "Нету"}</td>
                      <td>{user.role}</td>
                      <td>{user.products?.length || 0}</td>
                      <td>{user.comments?.length || 0}</td>
                      <td>{user.isActivated ? "true" : "false"}</td>
                      <td className={styles.actionsCell}>
                        <ActionsMenu
                          id={user.id}
                          onEdit={() => setEditingUserId(user.id)}
                          onDelete={() => setDeleteUserId(user.id)}
                          />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <h2>Товар</h2>
            {isProductsLoading ? (
              <p>Загрузка товара...</p>
            ) : (
              <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Описание</th>
                    <th>Цена</th>
                    <th>Картинка</th>
                    <th>Пользователь</th>
                    <th>Лайки</th>
                    <th>Комментарии</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product.product.id}>
                      <td>{product.product.id}</td>
                      <td>{product.product.title}</td>
                      <td>{product.product.description}</td>
                      <td>{product.product.price}</td>
                      <td>
                        <img
                          className={styles.productImg}
                          src={`${BASE_URL}${product.product.avatarUrl}`}
                          alt=""
                        />
                      </td>
                      <td>{product.product.user?.name || "Unknown"}</td>
                      <td>{product.product.likes?.length || 0}</td>
                      <td>{product.product.comments?.length || 0}</td>

                      <td className={styles.actionsCell}>
                        <ActionsMenu
                          id={product.product.id}
                          onEdit={() => setEditingProductId(product.product.id)}
                          onDelete={() =>
                            setDeleteProductId(product.product.id)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "comments" && (
          <div>
            <h2>Комментарии</h2>
            <div className={styles.commentControls}>
              <label htmlFor="product-id-input">ID Продукта: </label>
              <input
                id="product-id-input"
                type="text"
                value={inputProductId}
                onChange={e => setInputProductId(e.target.value)}
                placeholder="ID Продукта"
                className={styles.input}
              />
              <button
                onClick={handleFetchComments}
                disabled={!inputProductId.trim() || isCommentsLoading}
                className={styles.fetchButton}
              >
                {isCommentsLoading ? "Loading..." : "Получить комментарии"}
              </button>
            </div>

            {isCommentsLoading ? (
              <p>Loading comments...</p>
            ) : (
              <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Текст</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment: any) => (
                    <tr key={comment.id}>
                      <td>{comment.id}</td>
                      <td>{comment.text}</td>
                      <td className={styles.actionsCell}>
                        <ActionsMenu
                          id={comment.id}
                          onDelete={() => setDeleteCommentId(comment.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}
        {activeTab === "orders" && (
          <div>
            <h2>Заказы</h2>
            {isOrdersLoading ? (
              <p>Загрузка заказов...</p>
            ) : (
              <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Пользователь</th>
                    <th>Сумма</th>
                    <th>Дата</th>
                    <th>Кол-во товаров</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.user?.name || "—"}</td>
                      <td>{order.totalPrice} ₽</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{order.items.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}
      </div>
      {editingProductId && (
        <div className={styles.modelEdit}>
          <EditProductModal
            product={editingProduct}
            onClose={handleProductUpdated}
          />
        </div>
      )}
      {deleteProductId && (
        <div className={styles.modelEdit}>
          <DeleteProductModal
            productID={deleteProductId}
            onClose={handleProductDeleted}
          />
        </div>
      )}
      {deleteCommentId && (
        <div className={styles.modelEdit}>
          <DeleteCommentModal
            productID={deleteCommentId}
            onClose={handleCommentDeleted}
          />
        </div>
      )}
      {deleteUserId && (
        <div className={styles.modelEdit}>
          <DeleteUserModal
            productID={deleteUserId}
            onClose={handleUserDeleted}
          />
        </div>
      )}
      {editingUserId && editingUser && (
        <div className={styles.modelEdit}>
          <EditUserModal product={editingUser} onClose={handleUserUpdated} />
        </div>
      )}
    </div>
  )
}

export default AdminPanel
