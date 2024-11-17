import { json, redirect } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { authContextReference } from "../context/AuthProvider";

export default function AuthPage() {
  return <AuthForm />;
}

export async function action({ request }) {
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get("mode") || "signup";

  if (mode !== "login" && mode !== "signup") {
    throw new Error("Selected mode doesn't exist");
  }

  const data = await request.formData();
  const authData = {
    name: data.get("name"),
    surname: data.get("surname"),
    email: data.get("email"),
    password: data.get("password"),
    isBlocked: false,
    lastSeen: [new Date().toISOString()],
  };

  if (mode === "signup") {
    if (
      !authData.email ||
      !authData.password ||
      authData.password !== data.get("passwordConfirmation")
    ) {
      return new Response(
        JSON.stringify({
          message: "Invalid input. Please check your entries.",
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const response = await fetch(
      "https://auth-app-7f344-default-rtdb.europe-west1.firebasedatabase.app/users.json"
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ message: "Error fetching existing users." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const existingUsers = await response.json();
    const usersArray = existingUsers
      ? Object.keys(existingUsers).map((key) => ({
          id: key,
          ...existingUsers[key],
        }))
      : [];

    const emailExists = usersArray.some(
      (user) => user.email === authData.email
    );
    if (emailExists) {
      return new Response(
        JSON.stringify({ message: "Email is already registered." }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const createResponse = await fetch(
      "https://auth-app-7f344-default-rtdb.europe-west1.firebasedatabase.app/users.json",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      }
    );

    if (!createResponse.ok) {
      return new Response(
        JSON.stringify({ message: "Error creating user. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const createResponseData = await createResponse.json();
    const userId = createResponseData.name;

    authContextReference.showStatus("Signed up successfully!")
    authContextReference.externalSetIsLogged(true);
    authContextReference.setCurrentSession(userId);
    return redirect("/");
  }

  if (mode === "login") {
    const response = await fetch(
      "https://auth-app-7f344-default-rtdb.europe-west1.firebasedatabase.app/users.json"
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ message: "Error fetching users." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
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
        user.email === authData.email &&
        user.password === authData.password &&
        user.isBlocked === false
    );

    if (!matchingUser) {
      return new Response(
        JSON.stringify({ message: "Invalid login credentials." }),
        {
          status: 501,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const timestamp = new Date().toISOString();
    const updatedLastSeen = [...(matchingUser.lastSeen || []), timestamp];

    const updateResponse = await fetch(
      `https://auth-app-7f344-default-rtdb.europe-west1.firebasedatabase.app/users/${matchingUser.id}.json`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastSeen: updatedLastSeen }),
      }
    );

    if (!updateResponse.ok) {
      return new Response(
        JSON.stringify({ message: "Error updating user activity." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    authContextReference.showStatus("Logged in successfully!")
    authContextReference.externalSetIsLogged(true);
    authContextReference.setCurrentSession(matchingUser.id);
    return redirect("/");
  }

  return new Response(JSON.stringify({ message: "Invalid operation." }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
