// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { runTransaction, collection, getDoc, getDocs, getFirestore, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";

import { authContextReference } from "./context/AuthProvider";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBq8rNiMXRo5FP8UB9vfawuP1GIlyabijs",
  authDomain: "auth-app-7f344.firebaseapp.com",
  databaseURL:
    "https://auth-app-7f344-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "auth-app-7f344",
  storageBucket: "auth-app-7f344.firebasestorage.app",
  messagingSenderId: "853605373602",
  appId: "1:853605373602:web:1a16705e91933735b029fb",
  measurementId: "G-XHR4PGX2VX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function updateData(docId, newData) {
  const docRef = doc(db, "users", docId);
  try {
    await updateDoc(docRef, newData);
    console.log("Document updated successfully!")
  } catch (e) {
    console.error("Error updating document: ", e.message)
  }
}

export async function updateLastLogin(docId, date) {
  const docRef = doc(db, "users", docId);
  try {
    await updateDoc(docRef, { lastSeen: date });
    console.log("Document updated successfully!")
  } catch (e) {
    console.error("Error updating document: ", e.message)
  }
}

export async function deleteData(docId) {
  const docRef = doc(db, "users", docId);
  try {
    await deleteDoc(docRef);
    console.log("Document deleted successfully!")
  } catch (e) {
    console.error("Error deleting document: ", e.message)
  }
}

export async function isEmailUnique(email) {
  const emailNormalized = email.toLowerCase();
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", emailNormalized));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}

export async function registerUser(email, userData) {
  const userRef = doc(db, "users", email.toLowerCase());

  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(userRef);
      
      if (docSnap.exists()) {
        throw new Error("Email is already registered.");
      }

      transaction.set(userRef, { ...userData, email: email.toLowerCase() });
    });

    console.log("User registered successfully!");
    authContextReference.showStatus("Signed up successfully!");
    authContextReference.externalSetIsLogged(true);
    authContextReference.setCurrentSession(email.toLowerCase());
    return email;

  } catch (error) {
    console.error("Error registering user:", error.message);
    throw new Error("Registration failed.");
  }
}


export async function loginUser(email, password) {
  const userRef = doc(db, "users", email.toLowerCase());
  try {
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found.");
    }

    const userData = userSnap.data();

    if (userData.password !== password) {
      throw new Error("Invalid password.");
    }

    if (userData.isBlocked === true) {
      throw new Error("This user is blocked.")
    } else if (userData.isBlocked === undefined || null) {
      throw new Error("Error")
    }
    console.log(userRef)

    const lastSeen = new Date().toISOString();
    await updateDoc(userRef, { lastSeen });

    authContextReference.showStatus("Logged in successfully!");
    authContextReference.externalSetIsLogged(true);
    authContextReference.setCurrentSession(email.toLowerCase());
    updateLastLogin(email, new Date().toISOString())
    return {
      message: "Login successful",
      user: {
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        lastSeen,
      },
    };
  } catch (error) {
    console.error("Invalid credentials.");
    throw new Error(error.message);
  }
}

export async function fetchAllUsers() {
  try {
    const usersCollectionRef = collection(db, "users"); // Reference to 'users' collection
    const querySnapshot = await getDocs(usersCollectionRef);

    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() }); // Combine document ID and data
    });

    console.log("Fetched users:", users);
    return users;
  } catch (error) {
    console.error("Error fetching users:", error.message);
    throw new Error("Failed to fetch users.");
  }
}

export async function deleteUser(userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    await deleteDoc(userDocRef);
    console.log("User updated successfully!")
  } catch (e) {
    console.error("Error updating user:", e.message);
    throw new Error("Failed to update the user.");
  }
}

export async function updateUser(userId, updatedData) {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, { isBlocked: updatedData });
    console.log("User updated successfully!")
  } catch (e) {
    console.error("Error updating user:", e.message);
    throw new Error("Failed to update the user.");
  }
}

export async function handleAction(userId, action) {
  const userDocRef = doc(db, "users", userId);

  try {
    if (action === "delete") {
      await deleteDoc(userDocRef);
      console.log(`User with ID ${userId} has been deleted.`);
      return { success: true, message: "User deleted successfully." };
    } else if (action === "block") {
      await updateDoc(userDocRef, { isBlocked: true });
      console.log(`User with ID ${userId} has been updated.`);
      return { success: true, message: "User updated successfully." };
    } else if (action === "unblock") {
      await updateDoc(userDocRef, { isBlocked: false });
      console.log(`User with ID ${userId} has been updated.`);
      return { success: true, message: "User updated successfully." };
    } else {
      throw new Error("Invalid action. Use 'delete' or 'update'.");
    }
  } catch (e) {
    console.error(e.message);
    return { success: false, message: e.message };
  }
}
