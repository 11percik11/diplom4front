import { Product } from "./types"
import { api } from "./api"

export const productApi = api.injectEndpoints({
  endpoints: builder => ({
    createProduct: builder.mutation<Product, FormData>({
      query: productData => ({
        url: "/product",
        method: "POST",
        body: productData,
      }),
    }),

    getAllProduct: builder.query<
      any,
      Record<string, string | number | undefined>
    >({
      query: params => {
        const searchParams = new URLSearchParams()

        for (const key in params) {
          if (params[key] !== undefined && params[key] !== "") {
            searchParams.append(key, String(params[key]))
          }
        }

        return {
          url: `/product?${searchParams.toString()}`,
          method: "GET",
        }
      },
    }),

    getProductById: builder.query<Product, string>({
      query: id => ({
        url: `/product/${id}`,
        method: "GET",
      }),
    }),
    deleteProduct: builder.mutation<void, string>({
      query: id => ({
        url: `/product/${id}`,
        method: "DELETE",
      }),
    }),
    // updateProduct: builder.mutation<
    //   Product,
    //   { userData: FormData; id: string }
    // >({
    //   query: ({ userData, id }) => ({
    //     url: `/product/${id}`,
    //     method: "PUT",
    //     body: userData,
    //     formData: true, // важно, чтобы не сериализовался как JSON
    //   }),
    // }),
    updateProduct: builder.mutation<
      Product,
      { userData: FormData; id: string }
    >({
      query: ({ userData, id }) => ({
        url: `/product/${id}`,
        method: "PUT",
        body: userData,
        // НЕ добавлять заголовок Content-Type,
        // чтобы fetch сам выставил правильный boundary для multipart/form-data
      }),
    }),

    getAllProductsForAdmin: builder.query<Product[], void>({
      query: () => ({
        url: "/productAll",
        method: "GET",
      }),
    }),
  }),
})

export const {
  useCreateProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useGetAllProductQuery,
  useGetProductByIdQuery,
  useLazyGetAllProductQuery,
  useLazyGetProductByIdQuery,
  useGetAllProductsForAdminQuery,
  useLazyGetAllProductsForAdminQuery,
} = productApi

export const {
  endpoints: {
    createProduct,
    deleteProduct,
    getAllProduct,
    getProductById,
    updateProduct,
    getAllProductsForAdmin,
  },
} = productApi
