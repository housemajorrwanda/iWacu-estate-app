import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import kiny from "./locales/kiny.json";

const LANGUAGE_KEY = "user-language";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  kiny: { translation: kiny },
};

const initI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

  const locales = Localization.getLocales();
  const deviceLanguage =
    locales.length > 0 && locales[0].languageCode
      ? locales[0].languageCode
      : "en";

  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage || deviceLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export const changeLanguage = async (lang: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export default i18n;
