import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";

import UsersList from "../components/UsersList";
import { AuthContext } from "../context/AuthProvider";
import { checkSession } from "../utils/checkSession";
import { fetchAllUsers, handleAction } from "../firebaseConfig";

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

    async function fetchUsers() {
      setIsLoading(true);
      try {
        // Reference the Firestore "users" collection
        const usersArray = await fetchAllUsers()
        setUsers(usersArray);
      } catch (error) { 
        console.error("Error fetching users:", error);
        showError("Failed to fetch users. Please try again.")
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [updateList, showError]);

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
      const response = await handleAction(userId, action);
      if (response.success === true) {
        showStatus(`${action}ed successfully!`)
      } else if (response.success === false) {
        showError(`Failed to ${action} user`)
      }
    }

    const automaticallyNavigated = selectedUsers.some(
      (obj) => obj === currentSession
    );
    setUpdateList((prev) => prev + 1);
    setSelectedUsers([]);
    if (automaticallyNavigated && (action === "block" || action === "delete")) {
      setCurrentSession("");
      switchIsLogged();
      return navigate("/");
    }
  };

  return (
    <div className="flex flex-col max-w-4xl min-w-4xl p-5 absolute top-1 left-1">
      <div className="flex flex-wrap items-center gap-4 mb-1">
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
                onClick={() =>
                  setFilters({ ...filters, selectedValue: "name" })
                }
              >
                By Name
              </li>
            </ul>
          )}
        </div>
      </div>
      <div className="">
        <div className="grid grid-cols-12 pt-1 pb-0.5 px-4 text-sm font-semibold text-gray-700 border-b border-gray-700">
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
