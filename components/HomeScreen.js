import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ItemCard from "./ItemCard";
import { getItems } from "./api";
import { useFocusEffect } from '@react-navigation/native';

const categories = ["All", "Art", "Electronics", "Fashion", "Collectibles"];

export default function HomeScreen({ navigation, route }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
  setLoading(true);
  try {
    const res = await getItems();
    // 排序，保证最新的在最前面
    setItems(res.data.slice().reverse());
  } catch (e) {
    alert("Failed to fetch items");
  }
  setLoading(false);
};
  useEffect(() => {
    fetchItems();
  }, []);

  // 核心：监听 forceRefresh 参数
  useEffect(() => {
    if (route.params?.forceRefresh) {
      fetchItems();
      navigation.setParams({ forceRefresh: false }); // 清空参数，防止反复刷新
    }
  }, [route.params?.forceRefresh]);

  const filtered = items.filter(
    item =>
      (category === "All" || item.category === category) &&
      (item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()))
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
              <ItemCard item={item} onPress={() => navigation.navigate("ItemDetail", { item })} />
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
    paddingTop: 50,
    paddingBottom: 12,
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
