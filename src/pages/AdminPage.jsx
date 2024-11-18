import { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";

import UsersList from "../components/UsersList";
import { AuthContext } from "../context/AuthProvider";
import { checkSession } from "../utils/checkSession";

export default function AdminPage() {
  const {
    isLogged,
    setCurrentSession,
    currentSession,
    switchIsLogged,
    showError,
    showStatus,
  } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [updateList, setUpdateList] = useState(0);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    optionsShown: false,
    selectedValue: "lastSeen",
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilters((prevFilters) => ({
          ...prevFilters,
          optionsShown: false,
        }));
      }
    };

    if (filters.optionsShown) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [filters.optionsShown]);

  useEffect(() => {
    console.log("Filters updated:", filters);
  }, [filters, updateList]);

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
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [updateList]);

  if (!isLogged) {
    return <Navigate to="/" />;
  }

  const handleSelectUser = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleBulkAction = async (action) => {
    const isInvalidSession = await checkSession(currentSession);
    if (isInvalidSession === false) {
      navigate("/");
      showError("You have been blocked or deleted.");
      switchIsLogged();
      setCurrentSession("");
      return;
    }
    for (const userId of selectedUsers) {
      const user = users.find((user) => user.id === userId);
      if (!user) continue;

      let method = "PATCH";
      let body = {};
      if (action === "delete") {
        method = "DELETE";
      } else if (action === "block") {
        body = { isBlocked: true };
      } else if (action === "unblock") {
        body = { isBlocked: false };
      }

      try {
        const response = await fetch(
          `https://auth-app-7f344-default-rtdb.europe-west1.firebasedatabase.app/users/${user.id}.json`,
          {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        const capitalizedAction =
          action.charAt(0).toUpperCase() + action.slice(1);

        showStatus(`${capitalizedAction}ed successfully!`);

        if (!response.ok) {
          throw new Error(`Failed to ${action} user: ${userId}`);
        }
      } catch (error) {
        console.error(`Error performing ${action} action:`, error);
      }
    }

    setUpdateList((prev) => prev + 1);
    setSelectedUsers([]);
  };

  return (
    <div className="flex flex-col gap-2 min-h- bg-gray-100 p-6">
      <div className="flex flex-row justify-between items-center">
        <Link
          to="/"
          className="p-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
        >
          Go Back
        </Link>
        <button
          className="p-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
          onClick={async () => {
            const isInvalidSession = await checkSession(currentSession);
            if (isInvalidSession === false) {
              navigate("/");
              showError("You have been blocked or deleted.");
              switchIsLogged();
              setCurrentSession("");
              return;
            }
            setUpdateList((prevUpdateList) => prevUpdateList + 1);
          }}
        >
          Update List
        </button>
      </div>
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Admin Panel: Registered Users
        </h1>

        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleBulkAction("block")}
              disabled={selectedUsers.length === 0}
              className={`p-2 rounded-md ${
                selectedUsers.length > 0
                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                  : "bg-gray-300 text-gray-700 cursor-not-allowed"
              }`}
            >
              Block
            </button>
            <button
              onClick={() => handleBulkAction("unblock")}
              disabled={selectedUsers.length === 0}
              className={`p-2 rounded-md ${
                selectedUsers.length > 0
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-300 text-gray-700 cursor-not-allowed"
              }`}
            >
              <i className="fa-solid fa-unlock"></i>
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              disabled={selectedUsers.length === 0}
              className={`p-2 rounded-md ${
                selectedUsers.length > 0
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-300 text-gray-700 cursor-not-allowed"
              }`}
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
          <div className="relative inline-block" ref={dropdownRef}>
            <button
              className="bg-blue-500 text-white hover:bg-blue-700 p-2 rounded-md"
              onClick={() =>
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  optionsShown: !prevFilters.optionsShown,
                }))
              }
            >
              Filter by
            </button>

            <ul
              className={`absolute mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 ${
                filters.optionsShown ? "block" : "hidden"
              }`}
            >
              <li
                className="cursor-pointer hover:bg-gray-100 p-2"
                onClick={() => {
                  setFilters({
                    ...filters,
                    selectedValue: "lastSeen",
                  });
                  console.log(filters);
                }}
              >
                By Last Login Time
              </li>
              <li
                className="cursor-pointer hover:bg-gray-100 p-2"
                onClick={() => {
                  setFilters({
                    ...filters,
                    selectedValue: "regDate",
                  });
                  console.log(filters);
                }}
              >
                By Date Registered
              </li>
              <li
                className="cursor-pointer hover:bg-gray-100 p-2"
                onClick={() => {
                  setFilters({
                    ...filters,
                    selectedValue: "name",
                  });
                  console.log(filters);
                }}
              >
                By Name
              </li>
            </ul>
          </div>
        </div>

        {isLoading ? (
          <div className="loader m-auto"></div>
        ) : (
          <UsersList
            users={users}
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            filterBy={filters.selectedValue}
          />
        )}
        {users.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No users found.</p>
        )}
      </div>
    </div>
  );
}
