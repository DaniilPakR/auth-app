import { useMemo, useContext } from "react";
import { Tooltip } from "react-tooltip";

import { AuthContext } from "./../context/AuthProvider";

export default function UsersList({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  filterBy,
}) {
  const { currentSession } = useContext(AuthContext);

  const sortedUsers = useMemo(() => {
    const clonedUsers = [...users];
    if (filterBy === "lastSeen") {
      return clonedUsers.sort((a, b) => {
        const lastSeenA = new Date(a.lastSeen[a.lastSeen.length - 1]);
        const lastSeenB = new Date(b.lastSeen[b.lastSeen.length - 1]);
        return lastSeenB - lastSeenA;
      });
    } else if (filterBy === "regDate") {
      return clonedUsers.sort((a, b) => {
        const regDateA = new Date(a.lastSeen[0]);
        const regDateB = new Date(b.lastSeen[0]);
        return regDateA - regDateB;
      });
    } else if (filterBy === "name") {
      return clonedUsers.sort((a, b) => a.name.localeCompare(b.name));
    }
    return clonedUsers;
  }, [filterBy, users]);

  return (
    <>
      {sortedUsers.map((user) => {
        const readableRegDate = user.lastSeen[0].toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });

        const readableLastSeenDate = user.lastSeen[
          user.lastSeen.length - 1
        ].toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });

        const regToolTip = user.lastSeen[0].toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        });
        const lastSeenToolTip = user.lastSeen[
          user.lastSeen.length - 1
        ].toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        });

        return (
          <div
            key={user.id}
            className="grid grid-cols-12 items-center border-b border-gray-700 py-3 px-4 hover:bg-gray-50 transition"
          >
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => onSelectUser(user.id)}
                className="form-checkbox"
              />
            </div>
            <div className="col-span-3 font-medium">
              {user.name} {user.surname} {currentSession === user.id && "(You)"}
            </div>
            <div className="col-span-4 text-gray-600">{user.email}</div>
            <div className="col-span-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  user.isBlocked
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {user.isBlocked ? "Blocked" : "Active"}
              </span>
            </div>
            <div
              className="col-span-2 text-gray-500"
              title={`Last Seen: ${lastSeenToolTip}`}
            >
              {readableLastSeenDate}
            </div>
          </div>
        );
      })}
      <Tooltip id="my-tooltip" />
    </>
  );
}
