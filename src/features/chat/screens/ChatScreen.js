import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useSelector } from "react-redux";
import Constants from "expo-constants";

// Tự động phát hiện địa chỉ WebSocket giống như axios
const getWsUrl = () => {
  if (Platform.OS === "web") {
    return "ws://localhost:5000";
  }
  const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (expoHost && expoHost !== "localhost") {
    return `ws://${expoHost}:5000`;
  }
  return "ws://10.0.2.2:5000";
};

export default function ChatScreen({ navigation }) {
  const { user, isLogin } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  
  const ws = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Nếu chưa đăng nhập, bắt buộc quay về đăng nhập
    if (!isLogin || !user) {
      navigation.navigate("Login");
      return;
    }

    const wsUrl = getWsUrl();
    console.log("Connecting WebSocket to:", wsUrl);

    // Khởi tạo kết nối WebSocket
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket Connected!");
      setConnected(true);
      setConnecting(false);
    };

    ws.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "history") {
          setMessages(payload.data);
        } else if (payload.type === "message") {
          setMessages((prev) => [...prev, payload.data]);
        }
      } catch (err) {
        console.error("Lỗi đọc dữ liệu socket:", err);
      }
    };

    ws.current.onerror = (e) => {
      console.error("WebSocket Error:", e);
      setConnected(false);
      setConnecting(false);
    };

    ws.current.onclose = (e) => {
      console.log("WebSocket Closed:", e.code, e.reason);
      setConnected(false);
      setConnecting(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [isLogin, user]);

  const handleSend = () => {
    if (!inputText.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const messagePayload = {
      type: "message",
      sender: user.id || user._id,
      senderName: user.name,
      senderRole: user.role,
      content: inputText.trim(),
    };

    ws.current.send(JSON.stringify(messagePayload));
    setInputText("");
  };

  const renderItem = ({ item }) => {
    const isMyMessage = item.sender === (user?.id || user?._id);
    const isAdmin = item.senderRole === "admin";

    return (
      <View
        style={[
          styles.messageRow,
          isMyMessage ? styles.myMessageRow : styles.otherMessageRow,
        ]}
      >
        {!isMyMessage && (
          <View style={styles.senderAvatar}>
            <Text style={styles.avatarText}>
              {item.senderName ? item.senderName.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>
        )}
        <View style={styles.messageContentArea}>
          {!isMyMessage && (
            <View style={styles.senderHeader}>
              <Text style={styles.senderName}>{item.senderName}</Text>
              {isAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
            </View>
          )}
          <View
            style={[
              styles.bubble,
              isMyMessage ? styles.myBubble : styles.otherBubble,
            ]}
          >
            <Text style={isMyMessage ? styles.myBubbleText : styles.otherBubbleText}>
              {item.content}
            </Text>
          </View>
          <Text
            style={[
              styles.timestamp,
              isMyMessage ? styles.myTimestamp : styles.otherTimestamp,
            ]}
          >
            {new Date(item.createdAt || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>💬 Phòng Chat Chung</Text>
          <Text style={styles.headerStatus}>
            {connecting ? (
              <Text style={{ color: "#aaa" }}>Đang kết nối...</Text>
            ) : connected ? (
              <Text style={{ color: "#4caf50" }}>● Đang trực tuyến</Text>
            ) : (
              <Text style={{ color: "#f44336" }}>● Mất kết nối</Text>
            )}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {connecting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>Đang tải lịch sử tin nhắn...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id || String(Math.random())}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!inputText.trim() || !connected) && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || !connected}
            >
              <Text style={styles.sendBtnText}>Gửi</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    height: 60,
    backgroundColor: "#1a1a1a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  backBtn: {
    paddingRight: 16,
  },
  backBtnText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerStatus: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#888",
    marginTop: 12,
    fontSize: 14,
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  myMessageRow: {
    justifyContent: "flex-end",
  },
  otherMessageRow: {
    justifyContent: "flex-start",
  },
  senderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e94560",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  messageContentArea: {
    maxWidth: "75%",
  },
  senderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  senderName: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "600",
  },
  adminBadge: {
    backgroundColor: "#e94560",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 6,
  },
  adminBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: "#e94560",
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: "#2a2a2a",
    borderBottomLeftRadius: 2,
  },
  myBubbleText: {
    color: "#fff",
    fontSize: 14,
  },
  otherBubbleText: {
    color: "#fff",
    fontSize: 14,
  },
  timestamp: {
    fontSize: 9,
    color: "#666",
    marginTop: 4,
  },
  myTimestamp: {
    textAlign: "right",
    marginRight: 2,
  },
  otherTimestamp: {
    textAlign: "left",
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#1a1a1a",
    borderTopWidth: 1,
    borderTopColor: "#222",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#2a2a2a",
    borderRadius: 22,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 14,
  },
  sendBtn: {
    width: 60,
    height: 40,
    backgroundColor: "#e94560",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: "#555",
  },
  sendBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
