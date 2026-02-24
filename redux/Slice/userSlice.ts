import { url } from "@/url";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const authapi = createApi({
  reducerPath: "AuthApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${url}/api/auth`,
    prepareHeaders: async (headers, {}) => {
      const token =await AsyncStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Token ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "register/",
        method: "POST",
        body: userData,
      }),
    }),
    loginUsers:builder.mutation({
      query:(userData)=>({
        url:"login/",
        method:"POST",
        body:userData
      })
    }),
    forgotPassword:builder.mutation({
      query:(email)=>({
        url:"forgot-password/",
        method:"POST",
        body:email
      })
    }),
    getProfile:builder.query<any, void>({
      query:()=>({
        url:"profile/",
        method:"GET",
      })
    })
  }),
});
export const { useRegisterUserMutation,useLoginUsersMutation,useForgotPasswordMutation,useGetProfileQuery } = authapi;
