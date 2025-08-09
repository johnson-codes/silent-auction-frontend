import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { getItems } from "./api";
// import { currentUser } from "./user";

export default function MyListingsScreen() {
  const { user, mongoUser } = useAuth();
  const [loading, setLoading] = useState(false); // Set to false since we're not loading from API
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      if (!mongoUser?._id) {
        setItems([]);
        return;
      }
      
      const res = await getItems(mongoUser._id);
      setItems(res.data);
      console.log("My listings loaded:", res.data.length);
    } catch (e) {
      console.error("Failed to fetch listings:", e);
      alert("Failed to fetch your listings");
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <Text style={styles.price}>Current Bid: ${item.currentBid}</Text>
        <Text style={styles.price}>Highest Bid: ${item.currentBid}</Text>
        <Text style={styles.deadline}>Ends: {item.deadline}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 18 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>My Listings</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : items.length === 0 ? (
        <Text style={{ color: "#888", marginTop: 60, textAlign: "center" }}>You haven't listed any items yet.</Text>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#f6f6fa",
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    alignItems: "center",
    elevation: 1
  },
  image: { width: 80, height: 80, borderRadius: 8, backgroundColor: "#eee" },
  title: { fontSize: 18, fontWeight: "bold" },
  desc: { color: "#444", fontSize: 12, marginBottom: 2 },
  price: { color: "#2196f3", fontWeight: "bold", marginTop: 2 },
  deadline: { color: "#666", fontSize: 12, marginTop: 2 }
});
