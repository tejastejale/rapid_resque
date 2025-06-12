import React, { useState, useEffect, useRef } from "react";
import * as GoogleGenerativeAI from "@google/generative-ai";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
} from "react-native";
// import * as Speech from "expo-speech";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import FlashMessage, { showMessage } from "react-native-flash-message";
import tw from "twrnc";
import { Icon } from "galio-framework";
import { isLoading } from "expo-font";

const DoctorChat = ({ setOpen, open }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStopIcon, setShowStopIcon] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // State for typing indicator
  const flatListRef = useRef(null);

  const API_KEY = "AIzaSyDSXcbKdICgrc6kfNeU187WgIibOF_Wrbo";

  useEffect(() => {
    const backAction = async () => {
      setOpen(!open);
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup the listener on unmount
  }, []);

  useEffect(() => {
    const startChat = async () => {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Initial prompt for doctor behavior
      const prompt =
        "You are a indian doctor providing helpful, accurate health advice in a friendly and concise manner. Keep responses short like maximum 100 words and always suggest seeing a real doctor for serious concerns and also dont add any bold words keep everything in normal text.";
      const result = await model.generateContent(prompt);
      const response = result.response;
      // const text = response.text();
      // console.log(text);

      // showMessage({
      //   message: "Welcome to Doctor Chat 🩺",
      //   description:
      //     "I'm here to assist you with your health concerns. How can I help you today?",
      //   type: "info",
      //   icon: "info",
      //   duration: 2000,
      //   color:""
      // });

      setMessages([
        {
          text: "Hello! I'm your virtual doctor. How can I assist you today?",
          user: false,
        },
      ]);
    };

    startChat();
  }, []);

  const sendMessage = async () => {
    if (!loading && userInput !== "") {
      setLoading(true);
      setIsTyping(true); // Show typing indicator
      const userMessage = { text: userInput, user: true };
      setMessages([...messages, userMessage]);

      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Send query as a medical question, ensuring concise responses
      const prompt = `You are a indian doctor providing helpful, accurate health advice. Respond briefly and concisely to this query: "${userMessage.text}"`;
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: text,
          user: false,
        },
      ]);
      setLoading(false);
      setUserInput(""); // Clear the input after sending
      setIsTyping(false); // Hide typing indicator

      // Uncomment to enable text-to-speech if needed
      // if (text) {
      //   Speech.speak(text);
      // }
      if (text && !isSpeaking) {
        Speech.speak(text);
        setIsSpeaking(true);
        setShowStopIcon(true);
      }
    }
  };

  const renderMessage = ({ item }) => (
    <View style={styles.messageContainer}>
      <Text
        style={[
          styles.messageText,
          item.user ? styles.userBubble : styles.botBubble,
        ]}
      >
        {/* {item.text.replaceAll("*", "")} */}
        {item.text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <Text key={index} style={{ fontWeight: "bold" }}>
                {part.slice(2, -2)}
              </Text>
            );
          } else {
            return <Text key={index}>{part}</Text>;
          }
        })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={tw`absolute z-10 top-0 right-0 bg-purple-600 rounded-full p-4 m-2`}
      >
        <Icon name="close" family="AntDesign" size={20} color="white" />
      </TouchableOpacity>

      <FlatList
        ref={flatListRef} // Attached ref to FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
      />

      {/* Typing indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>Typing...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Ask me your question..."
          onChangeText={setUserInput}
          value={userInput}
          onSubmitEditing={sendMessage}
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendIcon} onPress={sendMessage}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <FontAwesome name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", paddingTop: 50 },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 20,
    maxWidth: "100%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#7f22fe",
    color: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderBottomRightRadius: 0,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 15,
    color: "black",
    margin: 10,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    height: 50,
    color: "black",
    border: 1,
    borderColor: "black",
  },
  sendIcon: {
    padding: 10,
    backgroundColor: "#7f22fe",
    borderRadius: 25,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  clearIcon: {
    padding: 10,
    backgroundColor: "#d11a2a",
    borderRadius: 25,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  typingContainer: {
    padding: 10,
    alignItems: "center",
  },
  typingText: {
    fontSize: 16,
    color: "gray",
    fontStyle: "italic",
  },
});

export default DoctorChat;
