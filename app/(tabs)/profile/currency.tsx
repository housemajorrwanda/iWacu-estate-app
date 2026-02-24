import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Rates {
  [key: string]: number;
}

export default function ConvertScreen() {
  const [amount, setAmount] = useState<string>("0");
  const [fromCurrency, setFromCurrency] = useState<string>("BTC");
  const [toCurrency, setToCurrency] = useState<string>("USD");
  const [rates, setRates] = useState<Rates>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selecting, setSelecting] = useState<"from" | "to">("from");
  const [currencyList, setCurrencyList] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const API_URL = "https://api.exchangerate-api.com/v4/latest/";

  const fetchRates = async (base: string) => {
    const res = await fetch(`${API_URL}${base}`);
    const data = await res.json();
    setRates(data.rates);
    setCurrencyList(Object.keys(data.rates));
  };

  useEffect(() => {
    if (fromCurrency !== "BTC") {
      fetchRates(fromCurrency);
    }
  }, [fromCurrency]);

  const converted = useMemo(() => {
    if (!rates[toCurrency]) return "0";
    return (parseFloat(amount || "0") * rates[toCurrency]).toFixed(2);
  }, [amount, rates, toCurrency]);

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleKeyPress = (value: string) => {
    if (value === "back") {
      setAmount((prev) => prev.slice(0, -1));
    } else {
      setAmount((prev) => (prev === "0" ? value : prev + value));
    }
  };

  const filtered = currencyList.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="close" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Convert Currency</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Amount */}
      <TextInput
        style={styles.input}
        placeholder="Enter Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Text style={styles.amount}>
        {amount} {fromCurrency}
      </Text>

      <Text style={styles.preview}>
        <FontAwesome name="exchange" size={14} /> {amount} {fromCurrency} ={" "}
        {converted} {toCurrency}
      </Text>

      {/* From Card */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelecting("from");
          setModalVisible(true);
        }}
      >
        <View style={styles.cardLeft}>
          <View style={styles.iconGreen}>
            <FontAwesome name="bitcoin" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.cardTitle}>{fromCurrency}</Text>
            <Text style={styles.cardSub}>{amount}</Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={20} />
      </TouchableOpacity>

      {/* Swap */}
      <View style={styles.swapWrapper}>
        <TouchableOpacity style={styles.swapButton} onPress={swap}>
          <Ionicons name="swap-vertical" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* To Card */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelecting("to");
          setModalVisible(true);
        }}
      >
        <View style={styles.cardLeft}>
          <View style={styles.iconBlue}>
            <FontAwesome name="dollar" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.cardTitle}>{toCurrency}</Text>
            <Text style={styles.cardSub}>{converted}</Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={20} />
      </TouchableOpacity>

      {/* Convert Button */}
      {/* <TouchableOpacity onPress={swap} style={styles.convertBtn}>
        <Text style={styles.convertText}>Convert Now</Text>
      </TouchableOpacity> */}

      {/* Keypad */}

      {/* Currency Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <TextInput
            placeholder="Search currency..."
            style={styles.search}
            value={search}
            onChangeText={setSearch}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.currencyItem}
                onPress={() => {
                  selecting === "from"
                    ? setFromCurrency(item)
                    : setToCurrency(item);
                  setModalVisible(false);
                }}
              >
                <Text style={{ fontSize: 18 }}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    padding: 20,
  },
  input: {
    backgroundColor: "#F3F3F3",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 15,
    fontSize: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  enter: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
  amount: {
    fontSize: 42,
    textAlign: "center",
    fontWeight: "600",
    marginVertical: 10,
  },
  preview: {
    textAlign: "center",
    color: "#888",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#EDEDED",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconGreen: {
    backgroundColor: "#2E8B57",
    padding: 12,
    borderRadius: 25,
    marginRight: 15,
  },
  iconBlue: {
    backgroundColor: "#4F7DF3",
    padding: 12,
    borderRadius: 25,
    marginRight: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardSub: {
    color: "#777",
  },
  swapWrapper: {
    alignItems: "center",
    marginVertical: -15,
  },
  swapButton: {
    backgroundColor: "#999",
    padding: 14,
    borderRadius: 30,
    zIndex: 2,
  },
  convertBtn: {
    backgroundColor: "#123F3B",
    padding: 18,
    borderRadius: 40,
    alignItems: "center",
    marginTop: 25,
  },
  convertText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 30,
    justifyContent: "space-between",
  },
  key: {
    width: "30%",
    backgroundColor: "#E0E0E0",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginVertical: 8,
  },
  keyText: {
    fontSize: 22,
  },
  search: {
    borderWidth: 1,
    margin: 20,
    borderRadius: 15,
    padding: 12,
  },
  currencyItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
});
