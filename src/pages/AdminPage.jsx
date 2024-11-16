import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import UsersList from "../components/UsersList";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [updateList, setUpdateList] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    async function fetchUsers() {
      try {
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
              lastSeen: data[key].lastSeen.map(
                (dateString) => new Date(dateString)
              ),
            }))
          : [];

        setUsers(usersArray);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }

    fetchUsers();
    setIsLoading(false);
  }, [updateList]);

  return (
    <div className="flex flex-col gap-2 min-h-screen bg-gray-100 p-6">
      <div className="flex flex-row justify-between items-center">
        <Link
          to="/"
          className="p-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
        >
          Go Back
        </Link>
        <button
          className="p-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
          onClick={() =>
            setUpdateList(prevUpdateList => setUpdateList(prevUpdateList + 1))
          }
        >
          Update List
        </button>
      </div>
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Admin Panel: Registered Users
        </h1>
        {isLoading && <p>Loading...</p>}
        <UsersList
          users={users}
          onBlockUser={handleBlockUser}
          onDeleteUser={handleDeleteUser}
        />
        {users.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No users found.</p>
        )}
      </div>
    </div>
  );

  function handleBlockUser(userId) {
    console.log(`Block user with ID: ${userId}`);
  }

  function handleDeleteUser(userId) {
    console.log(`Delete user with ID: ${userId}`);
  }
}
