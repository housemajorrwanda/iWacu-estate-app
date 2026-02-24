import { AuthHeader } from "@/assets/images";
import LoginComponent from "@/components/AuthComponent/Login";
import SignUpComponent from "@/components/AuthComponent/SignUpComponent";
import { height, width } from "@/components/global";
import { useState } from "react";
// import useSocialAuth from "../hooks/useSocialAuth";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
export default function Signup() {
  const [choosenaction, setChoosenAction] = useState("Login");
  
  const actions = ["Login", "Sign up"];
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"} // "padding" works better on iOS
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView className="flex-1 flex flex-col" showsVerticalScrollIndicator={false}>
        <AuthHeader
          style={{
            flex: 1,
          }}
          width="100%"
          height={height * 0.6}
        />
        <View
          className="bg-[#F6F1F1] flex-1 -top-20 px-[8%] py-[4%]"
          style={{
            borderRadius: width * 0.09,
          }}
        >
          <View className="flex flex-row items-center justify-between">
            {actions?.map((action: string, index: number) => {
              return (
                <TouchableOpacity
                  onPress={() => setChoosenAction(action)}
                  className={`py-3 items-center w-[45%] rounded-full ${choosenaction == action ? "bg-black" : "bg-white border-border/40 border"}`}
                  key={index}
                >
                  <Text
                    className={`font-bold text-lg ${choosenaction == action && "text-white"}`}
                  >
                    {action}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {choosenaction == 'Login' && <LoginComponent />}
          {choosenaction == 'Sign up' && <SignUpComponent />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
