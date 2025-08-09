import axios from "axios";
import CONFIG from "../config.js";

const API_BASE = CONFIG.API_BASE_URL;

export const getItems = (sellerId) => {
  if (sellerId) {
    return axios.get(`${API_BASE}/items?sellerId=${sellerId}`);
  } else {
    return axios.get(`${API_BASE}/items`);
  }
};
export const placeBid = (itemId, bidderId, amount) =>
  axios.post(`${API_BASE}/bids`, { itemId, bidderId, amount });
export const getMyBids = (userId) => axios.get(`${API_BASE}/bids/user/${userId}`);

// Firebase user sync
export const syncFirebaseUser = (firebaseUid, name, email) =>
  axios.post(`${API_BASE}/auth/sync-firebase`, { firebaseUid, name, email });

// 新增注册接口
export const registerUser = (name, email, password, role = "bidder") =>
  axios.post(`${API_BASE}/auth/register`, { name, email, password, role });


export const uploadItem = async (itemData) => {
  // itemData 需为 FormData 实例
  return axios.post(`${API_BASE}/items`, itemData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const getNotifications = (userId) =>
  axios.get(`${API_BASE}/notifications/user/${userId}`);

export const getUnreadNotificationCount = (userId) =>
  axios.get(`${API_BASE}/notifications/${userId}/unread-count`);

export const markNotificationAsRead = (notificationId) =>
  axios.patch(`${API_BASE}/notifications/${notificationId}/read`);