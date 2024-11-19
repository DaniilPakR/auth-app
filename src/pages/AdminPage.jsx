import { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";

import UsersList from "../components/UsersList";
import { AuthContext } from "../context/AuthProvider";
import { checkSession } from "../utils/checkSession";
import { updateIndexesAfterDeletion } from "./AuthPage";

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

    if (action === "delete") {
      await updateIndexesAfterDeletion();
    }

    const automaticallyNavigated = selectedUsers.some(
      (obj) => obj === currentSession
    );
    console.log(selectedUsers);
    setUpdateList((prev) => prev + 1);
    setSelectedUsers([]);
    if (automaticallyNavigated && (action === "block" || action === "delete")) {
      setCurrentSession("");
      switchIsLogged();
      return navigate("/");
    }
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <div className="bg-gray-50 min-h-80 p-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Block Button */}
        <button
          onClick={() => handleBulkAction("block")}
          disabled={selectedUsers.length === 0}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            selectedUsers.length > 0
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Block
        </button>
        {/* Unblock Button */}
        <button
          onClick={() => handleBulkAction("unblock")}
          disabled={selectedUsers.length === 0}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            selectedUsers.length > 0
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <i className="fa-solid fa-unlock"></i>
        </button>
        {/* Delete Button */}
        <button
          onClick={() => handleBulkAction("delete")}
          disabled={selectedUsers.length === 0}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            selectedUsers.length > 0
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <i className="fa-solid fa-trash-can"></i>
        </button>
        {/* Update List Button */}
        <button
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition"
          onClick={async () => {
            const isInvalidSession = await checkSession(currentSession);
            if (!isInvalidSession) {
              navigate("/");
              showError("You have been blocked or deleted.");
              switchIsLogged();
              setCurrentSession("");
              return;
            }
            setUpdateList((prev) => prev + 1);
          }}
        >
          Update List
        </button>
        {/* Filter Button */}
        <div>
          <button
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition"
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              optionsShown: !prev.optionsShown,
            }))
          }
        >
          Filter By
        </button>
        {filters.optionsShown && (
          <ul className="absolute bg-white border border-gray-300 rounded-md shadow-lg mt-2 z-10">
            <li
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              onClick={() =>
                setFilters({ ...filters, selectedValue: "lastSeen" })
              }
            >
              By Last Login Time (latest)
            </li>
            <li
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              onClick={() =>
                setFilters({ ...filters, selectedValue: "regDate" })
              }
            >
              By Date Registered (earliest)
            </li>
            <li
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              onClick={() => setFilters({ ...filters, selectedValue: "name" })}
            >
              By Name
            </li>
          </ul>
        )}
        </div>
        
        {/* Filter Dropdown */}

      </div>
      {/* User List */}
      <div className="space-y-4">
        {/* Heading */}
        <div className="grid grid-cols-12 py-1 px-4 text-sm font-semibold text-gray-700 border-b border-gray-700">
          <div className="col-span-1">
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={
                selectedUsers.length === users.length && users.length > 0
              }
              className="form-checkbox"
            />
          </div>
          <div className="col-span-3">Name</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Last Login Time</div>
        </div>
        {/* Scrollable User Items */}
        <div className="overflow-y-auto max-h-60 border rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center py-6">
              <div className="loader"></div>
            </div>
          ) : (
            <UsersList
              users={users}
              selectedUsers={selectedUsers}
              onSelectUser={handleSelectUser}
              filterBy={filters.selectedValue}
            />
          )}
          {!isLoading && users.length === 0 && (
            <p className="text-center text-gray-500 mt-6">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
  
}
