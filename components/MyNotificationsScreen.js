import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { currentUser } from "./user";
import { getNotifications, markNotificationAsRead } from "./api";

export default function MyNotificationsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications(currentUser.id);
      setNotifications(res.data);
    } catch (e) {
      alert("Failed to fetch notifications");
    }
    setLoading(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const renderIcon = (type) => {
    if (type === "bid") {
      return <MaterialCommunityIcons name="currency-usd" size={26} color="#2196f3" style={{ marginRight: 12 }} />;
    } else if (type === "end") {
      return <Ionicons name="flag-outline" size={26} color="#ea4335" style={{ marginRight: 12 }} />;
    } else if (type === "outbid") {
      return <MaterialCommunityIcons name="alert-circle" size={26} color="#ff9800" style={{ marginRight: 12 }} />;
    }
    return <Ionicons name="notifications-outline" size={26} color="#888" style={{ marginRight: 12 }} />;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.isRead && styles.unreadNotification,
        item.type === 'outbid' && styles.outbidNotification
      ]}
      onPress={() => markAsRead(item._id)}
    >
      <View style={styles.notificationContent}>
        {/* Item Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.itemImage || 'https://via.placeholder.com/50' }}
            style={styles.itemImage}
          />
          {item.type === 'bid' && (
            <View style={styles.bidBadge}>
              <Text style={styles.bidText}>$</Text>
            </View>
          )}
          {item.type === 'outbid' && (
            <View style={styles.outbidBadge}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#fff" />
            </View>
          )}
        </View>

        {/* Notification Content */}
        <View style={styles.textContainer}>
          <Text style={[
            styles.message,
            item.type === 'outbid' && styles.outbidMessage
          ]}>
            {item.message}
          </Text>
          
          {/* Show bid amount if it's a bid or outbid notification */}
          {(item.type === 'bid' || item.type === 'outbid') && item.bidAmount && (
            <Text style={[
              styles.bidAmount,
              item.type === 'outbid' && styles.outbidAmount
            ]}>
              {item.type === 'bid' ? 'New bid: ' : 'Outbid at: '}${item.bidAmount}
            </Text>
          )}
          
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>

        {/* Unread indicator */}
        {!item.isRead && (
          <View style={styles.unreadDot} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Notifications</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6c5ce7" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={true}
            style={styles.flatList}
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    padding: 16,
    paddingBottom: 30,
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#6c5ce7',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  bidBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  bidAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6c5ce7',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#6c5ce7',
    borderRadius: 4,
    marginLeft: 8,
  },
  outbidNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  outbidBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff9800',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outbidMessage: {
    color: '#e65100',
    fontWeight: '600',
  },
  outbidAmount: {
    color: '#ff9800',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});
