import { url } from "@/url";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const payApi = createApi({
  reducerPath: "PayApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${url}/api/payment/`,
    prepareHeaders: async (headers, {}) => {
      const token =await AsyncStorage.getItem("token");
      console.log("Payment Token:", token);
      if (token) {
        headers.set("Authorization", `Token ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    pay: builder.mutation({
      query: (data) => ({
        url: "pay/",
        method: "POST",
        body: data,
      }),
    }),
  }),
});
export const { usePayMutation } = payApi;