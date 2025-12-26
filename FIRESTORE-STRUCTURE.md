# FIRESTORE COLLECTIONS STRUCTURE

## 🔹 1️⃣ users (AUTH + ROLE)
Collection: users
Document ID: Firebase uid

Patient Example:
{
  "name": "Lakshya",
  "email": "lakshya@gmail.com",
  "role": "patient", 
  "condition": "Fever",
  "createdAt": "timestamp"
}

Doctor Example:
{
  "name": "Dr. Sharma",
  "email": "doctor@gmail.com",
  "role": "doctor",
  "createdAt": "timestamp"
}

## 🔹 2️⃣ checkins (PATIENT VITALS) - MOST IMPORTANT
Collection: checkins
Document ID: auto

{
  "patientId": "UID_FROM_AUTH",
  "painLevel": 6,
  "symptoms": ["Fever", "Swelling"],
  "createdAt": "timestamp"
}

## 🔹 3️⃣ alerts (AUTO-GENERATED)
Collection: alerts
Document ID: auto

{
  "patientId": "UID_FROM_AUTH",
  "painLevel": 8,
  "status": "critical",
  "seen": false,
  "createdAt": "timestamp"
}

## 🔹 4️⃣ messages (CHAT)
Collection: messages
Document ID: chatId

{
  "senderId": "UID",
  "text": "Message content",
  "createdAt": "timestamp"
}
