import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";

let currentChatId = null;
let currentPatientId = null;

// Initialize chat
function initChat(patientId, doctorId = 'doctor1') {
  currentPatientId = patientId;
  currentChatId = `${patientId}_${doctorId}`;
  
  const chatBox = document.getElementById("chatBox");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendChat");
  
  if (!chatBox || !chatInput || !sendBtn) {
    console.error("Chat elements not found");
    return;
  }

  // Clear previous listeners
  chatBox.innerHTML = '<div class="loading">Loading chat...</div>';
  
  const messagesRef = collection(db, "chats", currentChatId, "messages");
  const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));

  // LIVE MESSAGES
  onSnapshot(messagesQuery, snap => {
    chatBox.innerHTML = "";
    
    if (snap.empty) {
      chatBox.innerHTML = '<div class="no-messages">No messages yet. Start the conversation!</div>';
      return;
    }
    
    snap.forEach(doc => {
      const m = doc.data();
      const isCurrentUser = m.sender === auth.currentUser?.uid;
      
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
      messageDiv.innerHTML = `
        <div class="message-content">${m.text}</div>
        <div class="message-time">${m.createdAt?.toDate().toLocaleTimeString()}</div>
      `;
      chatBox.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // SEND MESSAGE
  sendBtn.onclick = sendMessage;
  chatInput.onkeypress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };
}

async function sendMessage() {
  const chatInput = document.getElementById("chatInput");
  const text = chatInput.value.trim();
  
  if (!text || !currentChatId || !auth.currentUser) return;

  try {
    const messagesRef = collection(db, "chats", currentChatId, "messages");
    
    await addDoc(messagesRef, {
      sender: auth.currentUser.uid,
      text: text,
      createdAt: serverTimestamp()
    });
    
    chatInput.value = "";
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Failed to send message");
  }
}

// Export functions
window.initChat = initChat;
window.sendMessage = sendMessage;
