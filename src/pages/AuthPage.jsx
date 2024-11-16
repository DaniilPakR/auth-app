import { json, redirect } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { AuthContext, authContextReference } from "../context/AuthProvider";

export default function AuthPage() {
  return <AuthForm />;
}

export async function action({ request }) {
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get("mode") || "signup";

  if (mode !== "login" && mode !== "signup") {
    throw new Response(JSON.stringify({ message: "Unsupported mode" }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
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

  if (mode === "login") {
    const response = await fetch(
      "https://auth-app-7f344-default-rtdb.europe-west1.firebasedatabase.app/users.json"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();

    const usersArray = data
      ? Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))
      : [];

    const matchingUser = usersArray.find(
      (user) =>
        user.email === authData.email &&
        user.password === authData.password &&
        user.isBlocked === false
    );

    if (!matchingUser) {
      return json(
        { message: "Invalid credentials or account is blocked." },
        { status: 401 }
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
      throw new Error("Failed to update lastSeen");
    }

    authContextReference.externalSetIsLogged(true);

    return redirect("/");
  } else if (mode === "signup") {
    const response = await fetch(
      `https://auth-app-7f344-default-rtdb.europe-west1.firebasedatabase.app/users.json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      }
    );
    if (!response.ok) {
      throw new Response(
        JSON.stringify({ message: "Could not authenticate user." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    authContextReference.externalSetIsLogged(true);
  }

  return redirect("/");
}
