import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TextInput, Alert, Image, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { placeBid } from "./api";
import { currentUser } from "./user";

export default function ItemDetailScreen({ route, navigation }) {
  const { item, focusBid } = route.params;
  const [bid, setBid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bidInputRef = useRef(null);

  useEffect(() => {
    if (focusBid && bidInputRef.current) {
      // Focus on the bid input if coming from "Place Bid" button
      setTimeout(() => {
        bidInputRef.current.focus();
      }, 500);
    }
  }, [focusBid]);

  const handleBid = async () => {
    if (!bid || isNaN(bid) || Number(bid) <= (item.currentBid || item.price)) {
      Alert.alert("Invalid bid", "Please enter a valid amount higher than the current price.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Place the bid
      await placeBid(item._id || item.id, currentUser?.id, Number(bid));
      
      // Update the local item state to immediately reflect the change
      item.currentBid = Number(bid);
      
      // Clear the input
      setBid("");
      
      // Navigate back to homepage immediately and refresh
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: {
              screen: 'Home',
              params: { 
                forceRefresh: true,
                lastBidAmount: bid,
                lastBidItem: item.title
              }
            }
          }
        ]
      });
      
      // Show success message after a brief delay
      setTimeout(() => {
        Alert.alert(
          "Bid Successful! 🎉", 
          `You placed a bid of $${bid} for "${item.title}"`,
          [{ text: "Great!", style: "default" }]
        );
      }, 300);
      
    } catch (e) {
      Alert.alert("Bid Failed", e.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#6366f1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Item Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content - Organized Layout */}
      <View style={styles.mainContent}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category || "GENERAL"}</Text>
            </View>
          </View>
        </View>

        {/* Item Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        </View>

        {/* Price and Deadline Section */}
        <View style={styles.priceDeadlineSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Current Price</Text>
            <Text style={styles.price}>${item.currentBid || item.price || "0"}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.deadlineContainer}>
            <Text style={styles.deadlineLabel}>Ends On</Text>
            <Text style={styles.deadline}>{formatDate(item.deadline)}</Text>
          </View>
        </View>

        {/* Bidding Section */}
        <View style={styles.biddingSection}>
          <Text style={styles.bidTitle}>Place Your Bid</Text>
          
          <View style={styles.bidInputRow}>
            <View style={styles.inputContainer}>
              <Ionicons name="cash" size={20} color="#6366f1" style={styles.inputIcon} />
              <TextInput
                ref={bidInputRef}
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={bid}
                onChangeText={setBid}
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.bidButton, isSubmitting && styles.bidButtonDisabled]}
              onPress={handleBid}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" style={styles.buttonIcon} />
                  <Text style={styles.bidButtonText}>Placing Bid...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="hammer" size={20} color="#ffffff" style={styles.buttonIcon} />
                  <Text style={styles.bidButtonText}>Bid</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "ios" ? 8 : 30,
    paddingBottom: 11,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  placeholder: {
    width: 40,
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(99, 102, 241, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    lineHeight: 28,
  },
  description: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
  },
  priceDeadlineSection: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  priceContainer: {
    flex: 1,
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: "#6366f1",
  },
  divider: {
    width: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 20,
  },
  deadlineContainer: {
    flex: 1,
    alignItems: "center",
  },
  deadlineLabel: {
    fontSize: 13,
    color: "#dc2626",
    fontWeight: "500",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  deadline: {
    fontSize: 16,
    color: "#991b1b",
    fontWeight: "700",
  },
  biddingSection: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  bidTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  bidInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  bidButton: {
    backgroundColor: "#6366f1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 100,
  },
  bidButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowColor: "#9ca3af",
    shadowOpacity: 0.2,
  },
  buttonIcon: {
    marginRight: 6,
  },
  bidButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
