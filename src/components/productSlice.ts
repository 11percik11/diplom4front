// app/productSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../app/types";

interface ProductState {
  list: Product[]
}

const initialState: ProductState = {
  list: [],
}

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.list = action.payload
    },
    clearProducts: (state) => {
      state.list = []
    },
  },
})

export const { setProducts, clearProducts } = productSlice.actions
export default productSlice.reducer
