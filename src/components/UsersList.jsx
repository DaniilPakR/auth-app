import { Tooltip } from "react-tooltip";

export default function UsersList({ users, onBlockUser, onDeleteUser }) {
  return (
    <>
      <ul className="divide-y divide-gray-200">
        {users.map((user) => {
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
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {user.name} {user.surname}
                  </p>
                  <p className="text-gray-500">{user.email}</p>
                </div>
                <div className="text-sm text-gray-600 mr-4">
                  <p>
                    <span className="font-medium">Block Status:</span>{" "}
                    {user.isBlocked ? "Blocked" : "Active"}
                  </p>
                  <p
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content={regToolTip}
                    className='cursor-pointer'
                  >
                    <span className="font-medium">Date Registered:</span>{" "}
                    {readableRegDate}
                  </p>
                  <p
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content={lastSeenToolTip}
                    className='cursor-pointer'
                  >
                    <span className="font-medium">Last Logged in:</span>{" "}
                    {readableLastSeenDate}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition"
                  onClick={() => onBlockUser(user.id)}
                >
                  Block
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition"
                  onClick={() => onDeleteUser(user.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <Tooltip
        id="my-tooltip"
      />
    </>
  );
}
