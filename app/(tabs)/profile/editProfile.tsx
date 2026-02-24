import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function EditProfileScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Anderson");
  const [email, setEmail] = useState("alex.anderson@email.com");
  const [phone, setPhone] = useState("+62 0812 3456 7890");
  const [location, setLocation] = useState("Shibuya, Tokyo");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Green Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          {/* Profile Image */}
          <View style={styles.avatarWrapper}>
            <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
              <MaterialIcons name="photo-camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input label="First Name" value={firstName} onChange={setFirstName} />
          <Input label="Last Name" value={lastName} onChange={setLastName} />
          <Input label="Email" value={email} onChange={setEmail} />
          <Input label="Phone" value={phone} onChange={setPhone} />
          <Input label="Location" value={location} onChange={setLocation} />

          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface InputProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
}

const Input = ({ label, value, onChange }: InputProps) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput value={value} onChangeText={onChange} style={styles.input} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#1DB954",
    height: 220,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    left: 20,
    top: 20,
  },
  avatarWrapper: {
    alignItems: "center",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
  },
  cameraIcon: {
    position: "absolute",
    right: -5,
    bottom: 5,
    backgroundColor: "#000",
    padding: 6,
    borderRadius: 20,
  },
  form: {
    padding: 25,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#EEE",
    padding: 15,
    borderRadius: 25,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: "#1DB954",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  saveText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
