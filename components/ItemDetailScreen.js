import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TextInput, Alert, Image } from "react-native";
import axios from "axios";
import { currentUser } from "./user";

export default function ItemDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const [bid, setBid] = useState("");

  const handleBid = async () => {
    if (!bid || isNaN(bid) || Number(bid) <= (item.currentBid || item.price)) {
      Alert.alert("Invalid bid", "Please enter a valid amount higher than the current price.");
      return;
    }
    try {
      await axios.post("http://localhost:3000/api/bids", {
        itemId: item._id || item.id,
        amount: Number(bid),
        bidderId: currentUser?.id,
      });
      Alert.alert("Bid Successful", `You placed a bid of $${bid}!`, [
        {
          text: "OK",
          onPress: () => {
            // 跳转回主Tab的Home并强制刷新
            navigation.navigate('MainTabs', {
              screen: 'Home',
              params: { forceRefresh: true }
            });
          }
        }
      ]);
      setBid("");
    } catch (e) {
      Alert.alert("Bid Failed", e.response?.data?.message || "Unknown error");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
      <Text style={styles.price}>
        Current Price: ${item.currentBid || item.price || "-"}
      </Text>
      <Text style={styles.deadline}>Auction ends on: {item.deadline}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your bid"
        keyboardType="numeric"
        value={bid}
        onChangeText={setBid}
      />
      <Button title="Place Bid" onPress={handleBid} />
      <View style={{ marginTop: 30 }}>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 22, alignItems: "center", justifyContent: "center" },
  image: { width: 250, height: 200, borderRadius: 12, marginBottom: 24, backgroundColor: "#eee" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  desc: { color: "#333", marginBottom: 15, textAlign: "center" },
  price: { color: "#2d87f0", fontWeight: "bold", fontSize: 22, marginBottom: 8 },
  deadline: { color: "#636e72", fontSize: 15, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 12, width: "100%" }
});
