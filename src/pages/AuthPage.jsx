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
    email: data.get("email"),
    password: data.get("password"),
  };
  console.log(mode);
  console.log(authData);
  const response = await fetch(
    `https://auth-app-7f344-default-rtdb.europe-west1.firebasedatabase.app/${mode}.json`,
    {
      method: 'POST',
      headers: { "Content-Type": "application/json" }, body: JSON.stringify(authData)
    }
  );

  if (response.status === 422 || response.status === 401) {
    return response;
  }

  if (!response.ok) {
    throw new Response(JSON.stringify({ message: "Could not authenticate user." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  };

  authContextReference.externalSetIsLogged(true)

  return redirect('/');
}
