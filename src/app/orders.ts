import { api } from "./api"
import { Order } from "./types"

export const orderApi = api.injectEndpoints({
  endpoints: builder => ({
    // ✅ Создание заказа
    createOrder: builder.mutation<
      Order,
      {
        items: { productId: string; quantity: number; size: string }[]
        deliveryMethod: "courier" | "pickup"
        deliveryAddress?: string
      }
    >({
      query: orderData => ({
        url: "/orders",
        method: "POST",
        body: orderData,
      }),
    }),

    checkProductAvailability: builder.mutation<
      {
        available: boolean
        missingItem?: {
          variantId: string
          productTitle?: string
          size: string
          requestedQuantity?: number
          availableQuantity?: number
          reason: string
        }
      },
      {
        items: {
          variantId: string
          quantity: number
          size: string
        }[]
      }
    >({
      query: itemsData => ({
        url: "/orders/check",
        method: "POST",
        body: itemsData,
      }),
    }),

    // 🧾 Получение заказов текущего пользователя
    getMyOrders: builder.query<Order[], void>({
      query: () => ({
        url: "/orders",
        method: "GET",
      }),
    }),

    // 🔍 Получение одного заказа по ID
    getOrderById: builder.query<Order, string>({
      query: id => ({
        url: `/orders/${id}`,
        method: "GET",
      }),
    }),

    // 🗑 Удаление заказа
    deleteOrder: builder.mutation<{ message: string; orderId: string }, string>(
      {
        query: id => ({
          url: `/orders/${id}`,
          method: "DELETE",
        }),
      },
    ),

    // 🛠️ Только для админа: все заказы
    getAllOrders: builder.query<Order[], void>({
      query: () => ({
        url: "/admin/orders",
        method: "GET",
      }),
    }),

    // 🔍 Только для админа: заказы по userId
    getOrdersByUserId: builder.query<Order[], string>({
      query: userId => ({
        url: `/orders/user/${userId}`,
        method: "GET",
      }),
    }),

    updateOrderIsReady: builder.mutation<
      Order,
      { orderId: string; isReady: boolean }
    >({
      query: ({ orderId, isReady }) => ({
        url: `/${orderId}/ready`,
        method: "PATCH",
        body: { isReady },
      }),
    }),

    // Обновление isGivenToClient
    updateOrderIsGivenToClient: builder.mutation<
      Order,
      { orderId: string; isGivenToClient: boolean }
    >({
      query: ({ orderId, isGivenToClient }) => ({
        url: `/${orderId}/given`,
        method: "PATCH",
        body: { isGivenToClient },
      }),
    }),
  }),
})

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useDeleteOrderMutation,
  useGetAllOrdersQuery,
  useGetOrdersByUserIdQuery,
  useLazyGetMyOrdersQuery,
  useCheckProductAvailabilityMutation,
  useUpdateOrderIsGivenToClientMutation,
  useUpdateOrderIsReadyMutation,
} = orderApi

export const {
  endpoints: {
    createOrder,
    getMyOrders,
    getOrderById,
    deleteOrder,
    getAllOrders,
    getOrdersByUserId,
  },
} = orderApi
