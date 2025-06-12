import { useState, useEffect } from "react"
import { useGetAllUserQuery } from "../../app/userApi"
import { useAllCommentMutation } from "../../app/commentsApi"
import styles from "./AdminPanel.module.css"
import { ActionsMenu } from "../ActionsMenu/ActionsMenu"
import EditProductModal from "../EditProductModal/EditProductModal"
import { BASE_URL } from "../../constants"
import DeleteProductModal from "../DeleteProductModal/DeleteProductModal"
import DeleteCommentModal from "../DeleteCommentModal/DeleteCommentModal"
import DeleteUserModal from "../DeleteUserModal/DeleteUserModal"
import EditUserModal from "../EditUserModal/EditUserModal"
import {
  useGetAllProductQuery,
  useLazyGetProductByIdQuery,
} from "../../app/productApi"
import { useGetAllOrdersQuery } from "../../app/orders"
import {
  useDeleteDiscountMutation,
  useGetAllDiscountsQuery,
} from "../../app/discount"

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<
    "users" | "products" | "comments" | "orders" | "discounts"
  >("users")

  const [deleteDiscountId, setDeleteDiscountId] = useState<string | null>(null)

  const [deleteDiscount] = useDeleteDiscountMutation()

  const { refetch: refetchDiscounts } = useGetAllDiscountsQuery()

  const handleDiscountDeleted = async () => {
    if (deleteDiscountId) {
      try {
        await deleteDiscount(deleteDiscountId).unwrap()
        await refetchDiscounts()
      } catch (err) {
        console.error("Ошибка при удалении скидки:", err)
      } finally {
        setDeleteDiscountId(null)
      }
    }
  }

  const [showSearchResult, setShowSearchResult] = useState(false)

  const [inputProductId, setInputProductId] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")

  const [searchProductId, setSearchProductId] = useState("")
  const [
    triggerGetProductById,
    { data: searchedProduct, isFetching: isSearching },
  ] = useLazyGetProductByIdQuery()

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
  const editingUser = users.find((user: any) => user.id === editingUserId)
  const { data: discounts = [], isLoading: isDiscountsLoading } =
    useGetAllDiscountsQuery()
  // Фильтрация пользователей по роли
  const filteredUsers = users.filter(user => {
    if (roleFilter === "ALL") return true
    return user.role === roleFilter
  })

  useEffect(() => {
    if (activeTab === "users") {
      refetchUsers()
    } else if (activeTab === "products") {
      refetchProducts()
    }
  }, [activeTab, refetchUsers, refetchProducts])

  const handleTabChange = (
    tab: "users" | "products" | "comments" | "orders" | "discounts",
  ) => {
    setActiveTab(tab)
  }

  const { data: orders = [], isLoading: isOrdersLoading } =
    useGetAllOrdersQuery()

  const handleFetchComments = () => {
    if (inputProductId.trim()) {
      fetchComments({ productid: inputProductId })
    }
  }

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
        <button
          className={`${styles.tab} ${activeTab === "discounts" ? styles.active : ""}`}
          onClick={() => handleTabChange("discounts")}
        >
          Скидки
        </button>
      </div>
      <div className={styles.tabContent}>
        {activeTab === "users" && (
          <div>
            <div className={styles.filterControls}>
              <h2>Пользователи</h2>
              <div className={styles.roleFilter}>
                <label>Фильтр по роли:</label>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="ALL">Все</option>
                  <option value="ADMIN">Администраторы</option>
                  <option value="MANAGER">Менеджеры</option>
                  <option value="CLIENT">Клиенты</option>
                </select>
              </div>
            </div>
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
                    {filteredUsers.map(user => (
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
                {/* 🔍 Поиск по ID */}
                <div className={styles.productSearchContainer}>
                  <input
                    type="text"
                    placeholder="Введите ID товара"
                    value={searchProductId}
                    onChange={e => setSearchProductId(e.target.value)}
                    className={styles.input}
                  />
                  <button
                    onClick={() => {
                      if (searchProductId.trim()) {
                        triggerGetProductById(searchProductId.trim())
                        setShowSearchResult(true)
                      }
                    }}
                    disabled={!searchProductId.trim() || isSearching}
                    className={styles.primaryButton}
                  >
                    {isSearching ? "Поиск..." : "Найти"}
                  </button>
                  <button
                    onClick={() => {
                      setSearchProductId("")
                      setShowSearchResult(false)
                    }}
                    disabled={!searchProductId}
                    className={styles.clearButton}
                  >
                    Очистить
                  </button>
                </div>

                {/* ✅ Результат поиска */}
                {showSearchResult && searchedProduct && (
                  <div className={styles.searchResult}>
                    <h4>Результат поиска:</h4>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Название</th>
                          <th>Описание</th>
                          <th>Цена</th>
                          <th>Пользователь</th>
                          <th>Лайки</th>
                          <th>Комментарии</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{searchedProduct.id}</td>
                          <td>{searchedProduct.title}</td>
                          <td>{searchedProduct.description}</td>
                          <td>{searchedProduct.price}</td>
                          <td>{searchedProduct.user?.name || "Unknown"}</td>
                          <td>{searchedProduct.likes?.length || 0}</td>
                          <td>{searchedProduct.comments?.length || 0}</td>
                          <td className={styles.actionsCell}>
                            <ActionsMenu
                              id={searchedProduct.id}
                              onEdit={() =>
                                setEditingProductId(searchedProduct.id)
                              }
                              onDelete={() =>
                                setDeleteProductId(searchedProduct.id)
                              }
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ❌ Если ничего не найдено
                {searchProductId && !searchedProduct && !isSearching && (
                  <p className={styles.notFound}>Товар с таким ID не найден.</p>
                )} */}

                {/* 📦 Общий список товаров */}
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Название</th>
                      <th>Описание</th>
                      <th>Цена</th>
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
                        <td>{product.product.user?.name || "Unknown"}</td>
                        <td>{product.product.likes?.length || 0}</td>
                        <td>{product.product.comments?.length || 0}</td>
                        <td className={styles.actionsCell}>
                          <ActionsMenu
                            id={product.product.id}
                            onEdit={() =>
                              setEditingProductId(product.product.id)
                            }
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
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td>{order.items.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {activeTab === "discounts" && (
          <div>
            <h2>Скидки</h2>
            {isDiscountsLoading ? (
              <p>Загрузка скидок...</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Процент</th>
                      <th>Сезон</th>
                      <th>Product ID</th>
                      <th>Variant ID</th>
                      <th>Начало</th>
                      <th>Конец</th>
                      <th>Создано</th>
                      <th>Автор</th>
                      <th>Email</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map(discount => (
                      <tr key={discount.id}>
                        <td>{discount.id}</td>
                        <td>{discount.percentage}%</td>
                        <td>{discount.season || "—"}</td>
                        <td>{discount.productId || "—"}</td>
                        <td>{discount.variantId || "—"}</td>
                        <td>{new Date(discount.startsAt).toLocaleString()}</td>
                        <td>{new Date(discount.endsAt).toLocaleString()}</td>
                        <td>{new Date(discount.createdAt).toLocaleString()}</td>
                        <td>{discount.createdBy?.name || "—"}</td>
                        <td>{discount.createdBy?.email || "—"}</td>
                        <td className={styles.actionsCell}>
                          <ActionsMenu
                            id={discount.id}
                            onDelete={() => setDeleteDiscountId(discount.id)}
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
      {deleteDiscountId && (
        <div className={styles.modelEdit}>
          <div className={styles.modal}>
            <p>Вы уверены, что хотите удалить эту скидку?</p>
            <button
              onClick={handleDiscountDeleted}
              className={styles.primaryButton}
            >
              Удалить
            </button>
            <button
              onClick={() => setDeleteDiscountId(null)}
              className={styles.clearButton}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
