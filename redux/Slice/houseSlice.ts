import { prepareFormData } from "@/components/functions/uploadingHouse";
import { url } from "@/url";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export interface houseCategory {
  id: string;
  name: string;
}
export interface house_imagesinterface {
  id: string;
  image: string;
}
export interface FeatureInterface {
  id: string;
  name: string;
  icon: string;
  add_available_number: boolean;
  is_additional_image_required: boolean;
  show_available_number: boolean;
  show_icon_only: boolean;
  show_name_only: boolean;
}

export interface HouseFeatureAssignment {
  id: string;
  available_number: string | null;
  images: string[];
  feature: FeatureInterface;
  custom_feature_name: string;
}
export interface house {
  id: string;
  thumbnail: string;
  house_category: houseCategory;
  house_category_data?: houseCategory;
  payment_category: string[];
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  price: number;
  currency: string;
  description: string;
  feature_assignments: HouseFeatureAssignment[];
  is_booked: boolean;
  house_images: house_imagesinterface[];
}
export interface categoryInterface {
  id: string;
  name: string;
}
export interface proximityInterface {
  id: string;
  name: string;
  icon: string;
  latitude: string;
  longitude: string;
}

export const HouseApi = createApi({
  reducerPath: "HouseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${url}/api/`,
    prepareHeaders: async (headers, { getState }) => {
      const token = await AsyncStorage.getItem("token");
      console.log("Token from AsyncStorage:", token); // Debugging log
      if (token) {
        headers.set("Authorization", `Token ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getHouses: builder.query<any[], { house_category?: string | null; search?: string }>({
      query: ({ house_category, search }) => {
        const params = new URLSearchParams();
        if (house_category) params.append("house_category", house_category);
        if (search) params.append("search", search);
        return `houses/?${params.toString()}`;
      },
    }),

    getSingleHouse: builder.query<any, string, void>({
      query: (id) => `houses/${id}`,
    }),
    getCategories: builder.query<categoryInterface[], void>({
      query: () => "categories/",
    }),
    getProximility: builder.query<proximityInterface[], void>({
      query: () => "proximity/",
    }),
    getAdditionalFeatures: builder.query<FeatureInterface[], void>({
      query: () => "/features",
    }),
    uploadHouse: builder.mutation<void, any>({
      query: (houseData: any) => {
        const formData = prepareFormData(houseData); // your existing function
        console.log("Form Data",formData);
        
        return {
          url: "houses/",
          method: "POST",
          body: formData,
          // headers: {
          //   "Content-Type": "multipart/form-data",
          // },
        };
      },
    }),
  }),
});
export const {
  useGetHousesQuery,
  useGetCategoriesQuery,
  useGetSingleHouseQuery,
  useGetProximilityQuery,
  useGetAdditionalFeaturesQuery,
  useUploadHouseMutation
} = HouseApi;
