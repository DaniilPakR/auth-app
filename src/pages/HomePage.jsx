import { useEffect, useContext, useState } from "react";

import { AuthContext } from "../context/AuthProvider";
import { Link } from "react-router-dom";

// https://auth-app-7f344-default-rtdb.europe-west1.firebasedatabase.app/${mode}.json

export default function HomePage() {
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const { isLogged, setIsLogged } = useContext(AuthContext);

  console.log(registeredUsers)

  const pageContent = isLogged ? (
    <>
      <Link
        to="/admin"
        className="w-full p-3 bg-blue-800 text-white font-semibold rounded-md hover:bg-blue-600"
      >
        Admin Panel
      </Link>
    </>
  ) : (
    <>
      <Link
        to="/auth?mode=login"
        className="w-full p-3 bg-blue-800 text-white font-semibold rounded-md hover:bg-blue-600"
      >
        Log in
      </Link>
      <Link
        to="/auth?mode=signup"
        className="w-full p-3 bg-blue-800 text-white font-semibold rounded-md hover:bg-blue-600"
      >
        Sign up
      </Link>
    </>
  );

  return (
    <h1>
      {pageContent}
      {isLogged ? "isLogged" : "is not logged"}
    </h1>
  );
}
