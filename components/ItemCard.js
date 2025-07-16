import React from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ItemCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.img} />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category || "General"}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        
        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Ionicons name="pricetag" size={14} color="#6366f1" />
            <Text style={styles.price}>
              ${item.currentBid ?? item.startingBid ?? "-"}
            </Text>
          </View>
          
          <View style={styles.timeContainer}>
            <Ionicons name="time" size={12} color="#6b7280" />
            <Text style={styles.timeText}>2d left</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.bidButton}>
          <Text style={styles.bidButtonText}>Place Bid</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    margin: 6,
    flex: 1,
    maxWidth: "47%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  img: { 
    width: "100%", 
    height: 120, 
    backgroundColor: "#f3f4f6",
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(99, 102, 241, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  content: {
    padding: 10,
  },
  title: { 
    fontSize: 15, 
    fontWeight: "600", 
    color: "#1f2937",
    marginBottom: 6,
    lineHeight: 18,
  },
  priceContainer: {
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  price: { 
    color: "#6366f1", 
    fontWeight: "bold", 
    fontSize: 16,
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    color: "#6b7280",
    fontSize: 12,
    marginLeft: 4,
  },
  bidButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  bidButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
});
