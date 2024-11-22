import { collection, getDocs } from "firebase/firestore";

import { db } from "../firebaseConfig";

export const checkSession = async (userId) => {
  const usersCollectionRef = collection(db, "users");
  const querySnapshot = await getDocs(usersCollectionRef);

  const usersArray = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    lastSeen: (doc.data().lastSeen),
  }));

  const matchingUser = usersArray.find((user) => user.id === userId);
  if (matchingUser === undefined) {
    console.error("No matching user found for ID:", userId);
    return false;
  } else if (matchingUser.isBlocked === true) {
    console.error("User is blocked:", userId);
    return false;
  } else {
    return true;
  }
};
