import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";
import { RootState } from "./store";

const baseQuery = fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    credentials: 'include',
    // mode: 'cors',
    prepareHeaders: (headers) => {
  const token = localStorage.getItem("token")
  if (token) {
    headers.set("authorization", `Bearer ${token}`)
  }
  return headers
}
})

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;


const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = baseQuery({ url: "/refresh", method: "GET" }, api, extraOptions)
        .then((refreshResult: any) => {
          isRefreshing = false;
          refreshPromise = null;

          if (refreshResult.data) {
            const newToken = (refreshResult.data as any).token;
            localStorage.setItem("token", newToken);
            api.dispatch({ type: "user/setToken", payload: newToken });
            return newToken;
          } else {
            localStorage.removeItem("token");
            api.dispatch({ type: "user/logout" });
            // window.location.href = "/auther";
            throw new Error("Refresh failed");
          }
        });
    }

    try {
      await refreshPromise;
      // повторяем оригинальный запрос после обновления токена
      result = await baseQuery(args, api, extraOptions);
    } catch {
      // refresh не удался
    }
  }

  return result;
};




// const baseQueryWithRetry = retry(baseQueryWithReauth, {maxRetries: 1});

export const api = createApi({
    reducerPath: "splitApi",
    baseQuery: baseQueryWithReauth,
    refetchOnMountOrArgChange: true,
    keepUnusedDataFor: 0,
    endpoints: () => ({}),
  })



















//   import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
// import { BASE_URL } from "../constants";
// import { RootState } from "./store";

// const baseQuery = fetchBaseQuery({
//     baseUrl: `${BASE_URL}/api`,
//     credentials: 'include',
//     // mode: 'cors',
//     prepareHeaders: (headers, { getState, endpoint }) => {
//   if (endpoint !== 'refresh') {
//     const token = (getState() as RootState).user.token || localStorage.getItem("token")
//     if (token) {
//       headers.set("authorization", `Bearer ${token}`)
//     }
//   }
//   return headers
// }
// })

// const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
//   let result = await baseQuery(args, api, extraOptions);
//   console.log(result);
  
//   // Если ошибка 401, пробуем обновить токен
//   if (result.error?.status === 401) {
//     // Пытаемся обновить токен
//     const refreshResult = await baseQuery(
//       { url: '/refresh', method: 'GET' },
//       api,
//       extraOptions
//     );
//     console.log(refreshResult.data == true);
//     console.log(refreshResult.data);
    
//     if (refreshResult.data) {
//       // Если успешно - сохраняем новый токен
//       const newToken = (refreshResult.data as any).token;
//       localStorage.setItem('token', newToken);
//       api.dispatch({ type: 'user/setToken', payload: newToken });
//       // Повторяем оригинальный запрос с новым токеном
//       result = await baseQuery(args, api, extraOptions);
//     } else {
//       // Если не удалось обновить - очищаем токен и редиректим на логин
//       localStorage.removeItem('token');
//       window.location.href = '/auther';
//     }
//   }

//   return result;
// };


// const baseQueryWithRetry = retry(baseQueryWithReauth, {maxRetries: 1});

// export const api = createApi({
//     reducerPath: "splitApi",
//     baseQuery: baseQueryWithRetry,
//     refetchOnMountOrArgChange: true,
//     endpoints: () => ({}),
//   })