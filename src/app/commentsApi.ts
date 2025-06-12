import { Comment } from "./types"
import { api } from "./api"

export const commentsApi = api.injectEndpoints({
  endpoints: builder => ({
    createComment: builder.mutation<Comment, { id: string; text: string }>({
      query: ({ id, text }) => ({
        url: `/comments/${id}`,
        method: "POST",
        body: { text }, // Если нужно передавать дополнительные поля, добавьте их здесь
      }),
    }),
    deleteComment: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/comments/${id}`,
        method: "DELETE",
      }),
    }),
    deleteAdminComment: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/deleteAdminComment/${id}`,
        method: "DELETE",
      }),
    }),
    updateComment: builder.mutation<Comment, { id: string; text: string }>({
      query: ({ id, text }) => ({
        url: `/comments/${id}`,
        method: "PUT",
        body: { text },
      }),
    }),
    allComment: builder.mutation<Comment[], { productid: string }>({
      query: ({ productid }) => ({
        url: `/comments/${productid}`,
        method: "GET",
      }),
    }),

    moderateComment: builder.mutation<Comment, { id: string }>({
      query: ({ id }) => ({
        url: `/comments/moderate/${id}`,
        method: "PUT",
      }),
    }),
    pendingComments: builder.query<Comment[], { hidden?: boolean }>({
  query: ({ hidden = false }) => ({
    url: `/commentsvisable/pending?hidden=${hidden}`,
    method: "GET",
  }),
}),

    setCommentHidden: builder.mutation<
      Comment,
      { id: string; hidden: boolean }
    >({
      query: ({ id, hidden }) => ({
        url: `/comments/${id}/hidden`,
        method: "PATCH",
        body: { hidden },
      }),
    }),
  }),
})

export const {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useDeleteAdminCommentMutation,
  useUpdateCommentMutation,
  useAllCommentMutation,
  useModerateCommentMutation,
  usePendingCommentsQuery,
  useSetCommentHiddenMutation,
} = commentsApi

export const {
  endpoints: {
    createComment,
    deleteComment,
    deleteAdminComment,
    updateComment,
    allComment,
    moderateComment,
    pendingComments,
    setCommentHidden,
  },
} = commentsApi
