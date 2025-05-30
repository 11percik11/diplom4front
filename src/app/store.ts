import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { api } from './api';
import user from '../components/userSlice'
import { listenerMiddleware } from '../middleware/auth';
import productReducer from "../components/productSlice";

export const store = configureStore({
  reducer: {
    product: productReducer,
    // [productApi.reducerPath]: productApi.reducer,
    [api.reducerPath]: api.reducer,
    user,
    
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(api.middleware)
      .prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>
