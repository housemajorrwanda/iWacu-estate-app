import useSocialAuth from "@/app/hooks/useSocialAuth";
import {
  FaceBookIcon,
  GoogleIcon,
  MailIcon,
  PasswordIcon,
} from "@/assets/images";
import { useLoginUsersMutation } from "@/redux/Slice/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import CheckBox from "../Reusable/CheckBox";
import InputField from "../Reusable/Input";
export default function LoginComponent() {
  const socialMeadias = [
    { name: "Google", icon: GoogleIcon, href: "/" },
    { name: "Facebook", icon: FaceBookIcon, href: "/" },
  ];
  const router=useRouter()
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error,setError]=useState(false)
  const [loginUser, { isLoading }] = useLoginUsersMutation();
  const { signInWithOAuth, loading: socialAuthLoading } = useSocialAuth();
  async function Login() {
    setError(false)
    if(!email || !password){
      return Alert.alert("Fill All fields","Email and password are required")
    }
    try {
      const result=await loginUser({email,password}).unwrap()
      console.log("Login Results",result);
      await AsyncStorage.setItem("token",result?.token)
      setError(false)
      router.replace("/(tabs)/home")
    } catch (error) {
      setError(true)
      console.log("error found",error);
      
    }
  }
  return (
    <View>
      <Spinner visible={isLoading} textContent="Loging in..." />
      <View className="flex flex-col flex-1 py-3 gap-y-2">
        {error && <Text className="text-red-800 font-bold text-center">Invalid Credentials</Text>}
        <InputField
          value={email}
          onChangeText={(e: string) => setEmail(e)}
          icon={<MailIcon />}
          placeholder="Email"
        />
        <InputField
          value={password}
          onChangeText={(e: string) => setPassword(e)}
          icon={<PasswordIcon />}
          placeholder="Password"
        />
      </View>
      <View className="flex flex-row items-center flex-1 justify-between">
        <CheckBox
          label="Remember Me?"
          checked={remember}
          onChange={setRemember}
        />
        <Link
          href={"/auths/forgetPassword"}
          className="text-border font-bold text-sm"
        >
          Forget Password
        </Link>
      </View>
      <TouchableOpacity onPress={Login} className="rounded-full py-3 px-4 bg-black w-[60%] my-3 self-center flex flex-col items-center justify-center">
        <Text className="text-white font-bold text-lg">Login</Text>
      </TouchableOpacity>
      <View className="flex flex-row items-center gap-x-2 py-2">
        <View className="h-[1px] flex-1 bg-border/40" />
        <Text className="text-black font-bold text-sm">Or Login With</Text>
        <View className="h-[1px] flex-1 bg-border/40" />
      </View>
      <View className="flex flex-row items-center justify-between">
        {socialMeadias?.map((socialMedia, index) => {
          const Icon = socialMedia?.icon;
          return (
            <TouchableOpacity
            onPress={() => signInWithOAuth(socialMedia?.name.toLowerCase()  as
                    | "google"
                    | "facebook"
                    | "apple")}
              key={index}
              className="flex flex-row bg-white gap-x-2 py-3 border border-border/40 px-3 rounded-full w-[35%]"
            >
              <Icon />
              <Text className="font-bold">{socialMedia?.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
