import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ItemCard from "./ItemCard";
import { useAuth } from "../contexts/AuthContext";
import { getItems } from "./api";
import { useFocusEffect } from '@react-navigation/native';

const categories = ["All", "Art", "Electronics", "Fashion", "Collectibles"];

export default function HomeScreen({ navigation, route }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(false); // Set to false since we're not loading from API

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getItems();
      console.log("API response:", res.data);
      
      // Ensure all items have required fields and sort by creation date
      const sortedItems = res.data.map(item => ({
        ...item,
        category: item.category || "Art" // Default category if missing
      })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      
      setItems(sortedItems);
      console.log("Items loaded successfully:", sortedItems.length);
    } catch (e) {
      console.error("Failed to fetch items:", e);
      alert("Failed to fetch items");
      setItems([]); // Set empty array on error
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchItems();
  }, []);

  // 核心：监听 forceRefresh 参数
  useEffect(() => {
    if (route.params?.forceRefresh) {
      console.log("Force refreshing items...");
      fetchItems();
      
      // Show success message if coming from a successful bid
      if (route.params?.lastBidAmount && route.params?.lastBidItem) {
        setTimeout(() => {
          Alert.alert(
            "Bid Updated Successfully! ✅",
            `Your bid of $${route.params.lastBidAmount} for "${route.params.lastBidItem}" is now the current highest bid!`,
            [{ text: "Awesome!", style: "default" }]
          );
        }, 800);
      }
      
      // Show success message if coming from a new item upload
      if (route.params?.newItemAdded) {
        setTimeout(() => {
          Alert.alert(
            "Item Listed Successfully! 🎉",
            "Your item has been added to the auction and is now visible to all users!",
            [{ text: "Great!", style: "default" }]
          );
        }, 800);
      }
      
      // Clear parameters to prevent repeated refreshes
      navigation.setParams({ 
        forceRefresh: false, 
        lastBidAmount: null, 
        lastBidItem: null,
        newItemAdded: false
      });
    }
  }, [route.params?.forceRefresh, route.params?.lastBidAmount, route.params?.lastBidItem, route.params?.newItemAdded]);

  const filtered = items.filter(
    item => {
      // Since we ensure all items have a category field, we can simplify this
      const categoryMatch = category === "All" || item.category === category;
      const searchMatch = search === "" || 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      
      return categoryMatch && searchMatch;
    }
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.header}>Auction Items</Text>
          <TouchableOpacity onPress={fetchItems} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Discover amazing deals and place your bids</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          placeholder="Search for items..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryRow}
        contentContainerStyle={{ paddingHorizontal: 12, alignItems: "center" }}
      >
        {categories.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.categoryBtn, category === c && styles.categoryBtnActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.categoryText, category === c && styles.categoryTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.itemsContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Loading auctions...</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            numColumns={2}
            keyExtractor={item => item._id || item.id}
            renderItem={({ item }) => (
              <ItemCard 
                item={item} 
                onPress={() => navigation.navigate("ItemDetail", { item })}
                onBidPress={(item) => navigation.navigate("ItemDetail", { item, focusBid: true })}
              />
            )}
            contentContainerStyle={styles.itemsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8fafc",
  },
  headerContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 38,
    paddingBottom: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  header: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#1f2937",
  },
  refreshButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 18,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: { 
    flex: 1,
    fontSize: 15,
    color: "#1f2937",
    paddingVertical: 8,
  },
  categoryRow: { 
    marginBottom: 12,
    paddingVertical: 4,
    maxHeight: 40,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
    height: 28,
  },
  categoryBtnActive: {
    backgroundColor: "#6366f1",
    shadowColor: "#6366f1",
    shadowOpacity: 0.3,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },
  categoryTextActive: {
    color: "#ffffff",
  },
  itemsContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  itemsList: {
    paddingBottom: 30,
  },
});
