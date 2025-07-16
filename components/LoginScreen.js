import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";
import { setCurrentUser } from "./user"; // 新增

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", { email, password });
      setCurrentUser(res.data.user);  // 保存用户
      navigation.replace("MainTabs");
    } catch (e) {
      alert("Login failed: " + (e.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Silent Auction</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={onLogin} />
      <TouchableOpacity onPress={() => navigation.replace("Register")}>
        <Text style={styles.link}>Don't have an account? Register here</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 30, marginBottom: 30, fontWeight: "bold", color: "#007AFF" },
  input: { width: "80%", borderWidth: 1, borderColor: "#ccc", padding: 12, marginVertical: 8, borderRadius: 8 },
  link: { marginTop: 18, color: "#007AFF" }
});
