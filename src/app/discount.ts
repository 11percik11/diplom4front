import { api } from "./api"

export interface DiscountPayload {
  productId?: string
  variantId?: string
  season?: "SUMMER" | "WINTER" | "ALL_SEASON"
  startsAt: string
  endsAt: string
  percentage: string
}

export interface Discount {
  id: string
  productId?: string
  variantId?: string
  season?: string
  startsAt: string
  endsAt: string
  createdAt: string
  updatedAt: string
  percentage?: number
  createdBy?: {
    id: string
    name: string
    email: string
    role: "ADMIN" | "MANAGER" | "CLIENT"
  }
}

export const discountApi = api.injectEndpoints({
  endpoints: builder => ({
    createDiscount: builder.mutation<Discount, DiscountPayload>({
      query: discountData => ({
        url: "/discount",
        method: "POST",
        body: discountData,
      }),
    }),

    getActiveDiscounts: builder.query<Discount[], void>({
      query: () => ({
        url: "/discounts/active",
        method: "GET",
      }),
    }),

    getAllDiscounts: builder.query<Discount[], void>({
      query: () => ({
        url: "/discounts/all",
        method: "GET",
      }),
    }),

    deleteDiscount: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/discount/${id}`,
        method: "DELETE",
      }),
    }),
  }),
})

export const {
  useCreateDiscountMutation,
  useGetActiveDiscountsQuery,
  useLazyGetActiveDiscountsQuery,
  useGetAllDiscountsQuery,
  useLazyGetAllDiscountsQuery,
  useDeleteDiscountMutation,
} = discountApi

export const {
  endpoints: {
    createDiscount,
    getActiveDiscounts,
    getAllDiscounts,
    deleteDiscount,
  },
} = discountApi
