import { redirect } from "react-router-dom";
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

  const dataSharing = data.get("dataSharing");
  const userLicense = data.get("userLicense");
  const ageConsent = data.get("ageConsent");

  if (mode === "signup") {
    if (!authData.name) {
      return new Response(
        JSON.stringify({
          message: "Name is missing. Please enter your name.",
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else if (!authData.surname) {
      return new Response(
        JSON.stringify({
          message: "Surname is missing. Please enter your surname.",
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else if (!authData.email) {
      return new Response(
        JSON.stringify({
          message: "Email is missing. Please enter an email.",
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else if (
      !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(authData.email)
    ) {
      return new Response(
        JSON.stringify({
          message: "Incorrect email format.",
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else if (!authData.password) {
      return new Response(
        JSON.stringify({
          message: "Password is missing. Please enter a password.",
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else if (authData.password !== data.get("passwordConfirmation")) {
      return new Response(
        JSON.stringify({
          message:
            "Passwords don't match. Please make sure your passwords match.",
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else if (!dataSharing || !userLicense || !ageConsent) {
      return new Response(
        JSON.stringify({
          message: "Please check all the required checkboxes.",
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

    const createId = await fetch(
      `https://auth-app-7f344-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      }
    );

    if (!createId.ok) {
      return new Response(
        JSON.stringify({ message: "Error creating user. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    authContextReference.showStatus("Signed up successfully!");
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
        user.password === authData.password
    );

    if (!matchingUser) {
      return new Response(
        JSON.stringify({ message: `Invalid login credentials.` }),
        {
          status: 501,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    if (matchingUser.isBlocked === true) {
      return new Response(
        JSON.stringify({ message: `This user is blocked.` }),
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

    // updating last seen (login time)

    if (!updateResponse.ok) {
      console.error("Error updating user last seen.");
    }

    authContextReference.showStatus("Logged in successfully!");
    authContextReference.externalSetIsLogged(true);
    authContextReference.setCurrentSession(matchingUser.id);
    return redirect("/");
  }

  return new Response(JSON.stringify({ message: "Invalid operation." }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
