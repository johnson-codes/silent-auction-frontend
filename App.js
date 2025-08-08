import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import HomeScreen from "./components/HomeScreen";
import UploadScreen from "./components/UploadScreen";
import BiddingScreen from "./components/BiddingScreen";
import MeScreen from "./components/MeScreen";
import ItemDetailScreen from "./components/ItemDetailScreen";
import MyListingsScreen from "./components/MyListingsScreen";
import MyNotificationsScreen from "./components/MyNotificationsScreen";
import { currentUser } from "./components/user";
import { getUnreadNotificationCount } from "./components/api";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Custom tab bar icon component
const TabIcon = ({ name, iconType, color, size, focused, label, badge }) => {
  const getIconComponent = () => {
    if (iconType === 'ionicons') {
      return <Ionicons name={name} size={size} color={color} />;
    } else {
      return <MaterialCommunityIcons name={name} size={size} color={color} />;
    }
  };

  return (
    <View style={styles.tabIconContainer}>
      <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
        {getIconComponent()}
        {badge && badge > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, { color: color }]}>{label}</Text>
    </View>
  );
};

function MainTabs() {
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchUnreadCount = async () => {
    try {
      if (currentUser && currentUser.id) {
        const response = await getUnreadNotificationCount(currentUser.id);
        setUnreadCount(response.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch unread count when component mounts and set up periodic refresh
  React.useEffect(() => {
    fetchUnreadCount();
    
    // Set up interval to check for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Also refresh when tabs gain focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarShowLabel: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          let iconType = 'material';
          let label;
          let badge = null;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
            iconType = 'material';
            label = "Home";
          } else if (route.name === "Upload") {
            iconName = focused ? "upload" : "upload-outline";
            iconType = 'material';
            label = "Upload";
          } else if (route.name === "Bidding") {
            iconName = focused ? "handshake" : "handshake-outline";
            iconType = 'material';
            label = "Bidding";
          } else if (route.name === "Me") {
            iconName = focused ? "person" : "person-outline";
            iconType = 'ionicons';
            label = "Me";
            badge = unreadCount > 0 ? unreadCount : null; // Only show badge if count > 0
          }

          return (
            <TabIcon 
              name={iconName} 
              iconType={iconType}
              color={color} 
              size={24} 
              focused={focused}
              label={label}
              badge={badge}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Bidding" component={BiddingScreen} />
      <Tab.Screen name="Me" component={MeScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
        <Stack.Screen
          name="MyListings"
          component={MyListingsScreen}
          options={{
            headerShown: true,
            title: "My Listings"
          }}
        />
        <Stack.Screen
          name="MyNotifications"
          component={MyNotificationsScreen}
          options={{
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconWrapper: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  iconWrapperFocused: {
    backgroundColor: '#f0f9ff',
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
