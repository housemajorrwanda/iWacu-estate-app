import { configureStore } from "@reduxjs/toolkit";
import filteredHousesReducer from "./Slice/filterState";
import { HouseApi } from "./Slice/houseSlice";
import { payApi } from "./Slice/Paymentslice";
import StateSlice from "./Slice/StateSlice";
import { authapi } from "./Slice/userSlice";
export const store = configureStore({
  reducer: {
    [HouseApi.reducerPath]: HouseApi.reducer,
    [authapi.reducerPath]: authapi.reducer,
    [payApi.reducerPath]: payApi.reducer,
    states: StateSlice,
    filteredHouses: filteredHousesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(HouseApi.middleware)
      .concat(authapi.middleware)
      .concat(payApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// function filteredHousesReducer(state: unknown, action: UnknownAction): unknown {
//   throw new Error("Function not implemented.");
// }
