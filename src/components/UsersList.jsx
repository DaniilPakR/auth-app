import { useMemo, useContext } from "react";
import { Tooltip } from "react-tooltip";

import {AuthContext} from "./../context/AuthProvider"

export default function UsersList({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  filterBy,
}) {

  const { currentSession } = useContext(AuthContext)

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
        return regDateB - regDateA;
      });
    } else if (filterBy === "name") {
      return clonedUsers.sort((a, b) => a.name.localeCompare(b.name));
    }
    return clonedUsers;
  }, [filterBy, users]);

  return (
    <div>
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          onChange={onSelectAll}
          checked={selectedUsers.length === users.length && users.length > 0}
          className="mr-2"
        />
        <span className="text-sm text-gray-700">Select All</span>
      </div>
      <ul className="divide-y divide-gray-200">
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
            <li
              key={user.id}
              className="py-4 px-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => onSelectUser(user.id)}
                  className="mr-2"
                />
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {user.name} {user.surname} {currentSession === user.id && "(You)"}
                  </p>
                  <p className="text-gray-500">{user.email}</p>
                  <p className="text-gray-700 font-semibold">
                    Status:{" "}
                    <span className="font-medium text-gray-500">
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col text-sm">
                <p className="font-semibold">Date Registered:</p>
                <p
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content={regToolTip}
                  className="cursor-pointer text-gray-600"
                >
                  {readableRegDate}
                </p>
                <p className="font-semibold">Last Login:</p>
                <p
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content={lastSeenToolTip}
                  className="cursor-pointer text-gray-600"
                >
                  {readableLastSeenDate}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <Tooltip id="my-tooltip" />
    </div>
  );
}
