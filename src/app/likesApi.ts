import { Like } from "./types"
import { api } from "./api"

export const likesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    rateProduct: builder.mutation<Like, { productId: string; rating: number }>({
      query: (body) => ({
        url: "/likes/rate",      // новый endpoint на сервере
        method: "POST",
        body,
      }),
    }),
    deleteRating: builder.mutation<void, { productId: string }>({
      query: (body) => ({
        url: "/likes/deleteRating",  // новый endpoint для удаления рейтинга
        method: "DELETE",
        body,
      }),
    }),
    deletelikeProduct: builder.mutation<void, { id: string }>({
      query: (body) => ({
        url: `/deletelikeProduct`,
        method: "DELETE",
        body,
      }),
    }),
  }),
})

export const {
  useRateProductMutation,
  useDeleteRatingMutation,
  useDeletelikeProductMutation,
} = likesApi

export const {
  endpoints: { rateProduct, deleteRating, deletelikeProduct },
} = likesApi
