import { User } from "./types";
import { api } from "./api";

export const userApi = api.injectEndpoints({
    endpoints: (builder) => ({
      login: builder.mutation<{ token: string },{ email: string; password: string }>({
        query: (userData) => ({
          url: "/login",
          method: "POST",
          body: userData,
          // credentials: 'include',
        }),
      }),
      register: builder.mutation<{ email: string; password: string; name: string, phone: string },{ email: string; password: string; name: string, phone: string }>({
        query: (userData) => ({
          url: "/register",
          method: "POST",
          body: userData,
        }),
      }),
      current: builder.query<User, void>({
        query: () => ({
          url: "/current",
          method: "GET",
        }),
      }),
      getUserById: builder.query<User, string>({
        query: (id) => ({
          url: `/users/${id}`,
          method: "GET",
        }),
      }),
      getAllUser: builder.query<User[], void>({
            query: () => ({
              url: "/allusers",
              method: "GET",
            }),
          }),
      updateUser: builder.mutation<User, { userData: FormData; id: string }>({
        query: ({ userData, id }) => ({
          url: `/users/${id}`,
          method: "PUT",
          body: userData,
        }),
      }),

      updateRole: builder.mutation<User, { userData: FormData }>({
        query: ({ userData }) => ({
          url: `/updaterole`,
          method: "PUT",
          body: userData,
        }),
      }),

      createAdmin: builder.mutation<{ email: string; password: string; name: string, adminpassword: string },{ email: string; password: string; name: string, adminpassword: string }>({
        query: (userData) => ({
          url: "/createadmin",
          method: "POST",
          body: userData,
        }),
      }),

      deleteUser: builder.mutation<void, { id: string }>({
        query: ({ id }) => ({
          url: `/deleteuser`,
          method: "DELETE",
          body: {id},
        }),
      }),
      activate: builder.mutation<void, { id: string }>({
        query: ({ id }) => ({
          url: `/activate/${id}`,
          method: "POST",
        }),
      }),
    }),
  })
  
  export const {
    useRegisterMutation,
    useLoginMutation,
    useCurrentQuery,
    useLazyCurrentQuery,
    useGetUserByIdQuery,
    useLazyGetUserByIdQuery,
    useUpdateUserMutation,
    useCreateAdminMutation,
    useGetAllUserQuery,
    useDeleteUserMutation,
    useUpdateRoleMutation,
    useActivateMutation,
  } = userApi
  
  export const {
    endpoints: { login, register, current, getUserById, updateUser, updateRole, createAdmin, getAllUser, deleteUser, activate },
  } = userApi
