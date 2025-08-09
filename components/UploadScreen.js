import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity, Image, StyleSheet, SafeAreaView, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from "../contexts/AuthContext";
import { uploadItem } from "./api";
// import { currentUser } from "./user";

export default function UploadScreen({ navigation }) {
  const { user, mongoUser } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Art"); // Default category
  const [startingBid, setStartingBid] = useState("");
  const [deadline, setDeadline] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(""); // 新增：图片URL
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Set default deadline to 1 month from today
  useEffect(() => {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    setSelectedDate(oneMonthFromNow);
    setDeadline(oneMonthFromNow.toLocaleString());
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "You need to allow access to photos.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.IMAGE,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setImageUrl(""); 
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setDeadline(date.toLocaleString());
    }
  };

  const showDateTimePicker = () => {
    // Only show date picker on mobile platforms
    if (Platform.OS === 'web') {
      Alert.alert(
        "Date Selection",
        "Date picker is not available on web. Using default date (1 month from today).",
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    setShowDatePicker(true);
  };

  const handleUpload = async () => {
    if ((!imageUrl && !image) || !title || !description || !startingBid || !deadline) {
      Alert.alert("Missing fields", "Please fill out all fields and select a photo or paste a network image URL.");
      return;
    }
    if (isNaN(startingBid) || Number(startingBid) <= 0) {
      Alert.alert("Invalid price", "Please enter a valid starting bid.");
      return;
    }

    // Ensure category is always set
    const selectedCategory = category && category.trim() ? category.trim() : "Art";

    // 组装 FormData
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", selectedCategory);
    formData.append("startingBid", startingBid);
    formData.append("deadline", deadline);
    if (mongoUser?._id) {
      formData.append("sellerId", mongoUser._id);
    }

    console.log("Uploading item with category:", selectedCategory);

    // 优先用 imageUrl，如果没填再用本地图片
    if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    } else if (image) {
      formData.append("image", {
        uri: image,
        type: "image/jpeg",
        name: "photo.jpg"
      });
    }

    try {
      await uploadItem(formData);
      
      // Clear the form
      setImage(null); 
      setImageUrl(""); 
      setTitle(""); 
      setDescription(""); 
      setCategory("Art");
      setStartingBid(""); 
      setDeadline("");
      setSelectedDate(new Date());
      
      // Navigate to homepage with refresh
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: {
              screen: 'Home',
              params: { 
                forceRefresh: true,
                newItemAdded: true
              }
            }
          }
        ]
      });
      
      // Show success message
      setTimeout(() => {
        Alert.alert("Success! 🎉", "Item uploaded successfully and is now live on the homepage!", [
          { text: "Great!", style: "default" }
        ]);
      }, 500);
      
    } catch (err) {
      Alert.alert("Upload failed", err.response?.data?.message || "Unknown error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Item</Text>
        <Text style={styles.headerSubtitle}>Create a new auction listing</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item Photo</Text>
          <TouchableOpacity style={styles.imageUploadBox} onPress={pickImage}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.uploadedImage} />
            ) : image ? (
              <Image source={{ uri: image }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="camera-outline" size={48} color="#6366f1" />
                <Text style={styles.uploadPlaceholderText}>
                  Upload a photo of your item or paste a network image URL below.
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* URL Input Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Or Paste Image URL</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="link-outline" size={20} color="#6366f1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor="#9ca3af"
              value={imageUrl}
              onChangeText={text => {
                setImageUrl(text);
                if (text) setImage(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Text style={styles.hint}>Supports direct web image links (jpg/png/webp...)</Text>
        </View>

        {/* Item Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item Details</Text>
          
          <Text style={styles.label}>Item Title</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="text-outline" size={20} color="#6366f1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter the title of your auction item"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
            />
          </View>
          <Text style={styles.hint}>Make it catchy!</Text>

          <Text style={styles.label}>Description</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="document-text-outline" size={20} color="#6366f1" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide a detailed description of the item"
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>
          <Text style={styles.hint}>Include any flaws or special features</Text>

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {["Art", "Electronics", "Fashion", "Collectibles"].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  category === cat && styles.categoryButtonTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.hint}>Choose the category that best describes your item</Text>

          <Text style={styles.label}>Starting Bid</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="cash-outline" size={20} color="#6366f1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter the starting bid amount"
              placeholderTextColor="#9ca3af"
              value={startingBid}
              onChangeText={setStartingBid}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.hint}>Don't forget the currency!</Text>

          <Text style={styles.label}>Auction End Time</Text>
          <TouchableOpacity style={styles.inputContainer} onPress={showDateTimePicker}>
            <Ionicons name="time-outline" size={20} color="#6366f1" style={styles.inputIcon} />
            <Text style={[styles.input, styles.dateText]}>
              {deadline || "1 month from today"}
            </Text>
            {Platform.OS !== 'web' && (
              <Ionicons name="calendar-outline" size={20} color="#6366f1" />
            )}
          </TouchableOpacity>
          <Text style={styles.hint}>
            {Platform.OS === 'web' 
              ? "Default: 1 month from today (date picker not available on web)"
              : "Tap to select date and time"
            }
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleUpload}>
          <Ionicons name="cloud-upload-outline" size={24} color="#ffffff" style={styles.buttonIcon} />
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Time Picker - Only render on mobile platforms */}
      {Platform.OS !== 'web' && showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
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
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  imageUploadBox: {
    height: 200,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    resizeMode: "cover",
  },
  uploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  uploadPlaceholderText: {
    color: "#6b7280",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 16,
    color: "#1f2937",
    paddingVertical: 14,
  },
  placeholderText: {
    color: "#9ca3af",
  },
  textArea: {
    paddingVertical: 14,
    textAlignVertical: "top",
  },
  hint: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: "italic",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  categoryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  categoryButtonTextActive: {
    color: "#ffffff",
  },
  submitButton: {
    backgroundColor: "#6366f1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 40,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
});
