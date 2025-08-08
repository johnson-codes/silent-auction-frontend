import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, ScrollView, Button, ActivityIndicator } from "react-native";
import ItemCard from "./ItemCard";
import { getItems } from "./api";
import { useFocusEffect } from '@react-navigation/native';

const categories = ["All", "Art", "Electronics", "Fashion", "Collectibles"];

export default function ItemGridScreen({ navigation, route }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getItems();
      setItems(res.data);
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
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 18 }}>
      <Text style={styles.header}>Auction Items</Text>
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search for items..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={fetchItems}>
          <Text style={{ color: "#fff", fontSize: 18 }}>🔍</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Find auctions, bids, and more.</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryRow}
        contentContainerStyle={{ paddingRight: 18, alignItems: 'center' }}
      >
        {categories.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.categoryBtn, category === c && styles.categoryBtnActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={{ fontWeight: "bold", color: category === c ? "#fff" : "#222", fontSize: 15 }}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.hint}>Select a category to filter items.</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
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
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
      <Button title="Log Out" onPress={() => navigation.replace("Login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: "bold", marginLeft: 16, marginBottom: 6 },
  searchRow: { flexDirection: "row", marginHorizontal: 16, marginBottom: 4 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8, backgroundColor: "#fafafa" },
  searchBtn: { backgroundColor: "#6495ed", borderRadius: 8, padding: 10, marginLeft: 8, justifyContent: "center", alignItems: "center" },
  hint: { color: "#888", marginLeft: 18, fontSize: 13, marginBottom: 6 },
  categoryRow: { flexDirection: "row", marginLeft: 10, marginBottom: 4, paddingVertical: 4 },
  categoryBtn: {
    width: 105,
    height: 40,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBtnActive: {
    width: 105,
    height: 40,
    backgroundColor: "#6495ed"
  },
});
