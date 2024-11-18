import { useContext } from "react";

import { AuthContext } from "../context/AuthProvider";
import { Link, useNavigate } from "react-router-dom";

export default function HomePage() {
  const { isLogged, setIsLogged, showError } = useContext(AuthContext);
  const navigate = useNavigate();

  const pageContent = isLogged ? (
    <>
      <button
        onClick={() => setIsLogged(false)}
        className="w-full p-3 bg-blue-800 text-white font-semibold rounded-md hover:bg-blue-600"
      >
        Log out
      </button>
    </>
  ) : (
    <p className="">
      <Link
        to="/auth?mode=login"
        className="w-full p-3 mr-2 bg-blue-800 text-white font-semibold rounded-md hover:bg-blue-600"
      >
        Log in
      </Link>
      <Link
        to="/auth?mode=signup"
        className="w-full p-3 bg-blue-800 text-white font-semibold rounded-md hover:bg-blue-600"
      >
        Sign up
      </Link>
    </p>
  );
  
  return (
    <h1 className="flex flex-col gap-4">
      <button
        onClick={() => {
          if (isLogged) {
            navigate('/admin')
          } else {
            showError("Log in to access Admin Page");
          }
        }}
        className="w-full p-3 bg-blue-800 text-white font-semibold rounded-md hover:bg-blue-600"
      >
        Admin Panel
      </button>
      {pageContent}
    </h1>
  );
}
