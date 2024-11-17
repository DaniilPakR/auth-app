import { redirect, json } from "react-router-dom";

import { authContextReference } from "../context/AuthProvider";

// https://auth-app-7f344-default-rtdb.europe-west1.firebasedatabase.app/users/

export const checkSession = async (userId) => {
  const response = await fetch(
    "https://auth-app-7f344-default-rtdb.europe-west1.firebasedatabase.app/users.json"
  );

  if (!response.ok) {
    return json(
      { message: "Error fetching users." },
      { status: 500 }
    );
  }

  const users = await response.json();
  const usersArray = users
    ? Object.keys(users).map((key) => ({
        id: key,
        ...users[key],
      }))
    : [];

  const matchingUser = usersArray.find(
    (user) =>
      user.id === userId,
  );
  if (matchingUser === undefined) {
    console.error("No matching user found for ID:", userId);
    return false;
  } else if (matchingUser.isBlocked === true) {
    console.error("User is blocked:", userId);
    return false;
  } else {
    return true;
  }
}