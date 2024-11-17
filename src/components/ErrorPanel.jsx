import { useContext } from "react";

import { AuthContext } from "../context/AuthProvider";

export default function ErrorPanel() {

  const { errorPanelMessage } = useContext(AuthContext)

  if (errorPanelMessage === "") {
    return null;
  }

  return (
    <div className="flex justify-center fixed top-4 left-1/2 transform -translate-x-1/2 w-96 bg-red-500 text-white p-4 rounded-md shadow-lg items-center">
      <p>{errorPanelMessage}</p>
    </div>
  );
}
