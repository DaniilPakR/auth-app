import { redirect } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { isEmailUnique, loginUser, registerUser } from "../firebaseConfig";
import validateSignupData from "../utils/validateSignupData";

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
    lastSeen: new Date().toISOString(),
    regDate: new Date().toISOString(),
  };

  const dataSharing = data.get("dataSharing");
  const userLicense = data.get("userLicense");
  const ageConsent = data.get("ageConsent");
  const passwordConfirmation = data.get("passwordConfirmation")

  if (mode === "signup") {
    validateSignupData(authData, passwordConfirmation, dataSharing, userLicense, ageConsent);

    const isUnique = await isEmailUnique(authData.email);
    if (!isUnique) {
      return new Response(
        JSON.stringify({ message: "Email is already registered." }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      await registerUser(authData.email, {...authData});
      return redirect("/");
    } catch (e) {
      return new Response(
        JSON.stringify({ message: "Signup failed. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    };
  }

  if (mode === "login") {
    
    try {
      const result = await loginUser(authData.email, authData.password);
      console.log(result.message);
      console.log(result.user);
      return redirect("/");
    } catch (e) {
      console.error(e.message)
      return new Response(
        JSON.stringify({ message: e.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  return new Response(JSON.stringify({ message: "Invalid operation." }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

