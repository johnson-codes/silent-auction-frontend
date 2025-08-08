import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, SafeAreaView, Platform } from "react-native";
import { getMyBids } from "./api";
import { currentUser } from "./user";

export default function BiddingScreen() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    setLoading(true);
    try {
      if (!currentUser?.id) return;
      const res = await getMyBids(currentUser.id);
      setItems(res.data);
    } catch (e) {
      alert("Failed to fetch your bids");
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <Text style={styles.price}>Current: ${item.currentBid}</Text>
        <Text style={styles.userBid}>Your Highest Bid: ${item.userMaxBid}</Text>
        <Text style={styles.deadline}>End: {item.deadline}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bids</Text>
        <Text style={styles.headerSubtitle}>Track your bidding activity</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No bidding history yet.</Text>
            <Text style={styles.emptyStateSubtext}>Start bidding on items to see them here!</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "ios" ? 8 : 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  image: { 
    width: 80, 
    height: 80, 
    borderRadius: 12, 
    backgroundColor: "#f1f5f9",
    marginRight: 16,
  },
  title: { 
    fontSize: 18, 
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  desc: { 
    color: "#6b7280", 
    fontSize: 13, 
    marginBottom: 8,
    lineHeight: 18,
  },
  price: { 
    color: "#3b82f6", 
    fontWeight: "600", 
    fontSize: 14,
    marginBottom: 4,
  },
  userBid: { 
    color: "#ef4444", 
    fontWeight: "600", 
    fontSize: 14,
    marginBottom: 4,
  },
  deadline: { 
    color: "#6b7280", 
    fontSize: 12,
    fontStyle: "italic",
  }
});
