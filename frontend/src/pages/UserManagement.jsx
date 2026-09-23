import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/user-management.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const [updatingUserId, setUpdatingUserId] = useState(null);
const [roleMessage, setRoleMessage] = useState("");
const [roleMessageType, setRoleMessageType] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const fetchUsers = async () => {
  try {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:8080/api/admin/users",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load users.");
    }

    const data = await response.json();
    setUsers(data);
  } catch (error) {
    console.error(error);

    setError(
      "Unable to load users. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchUsers();
}, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatRole = (role) => {
    if (role === "IT_SUPPORT") return "IT Support";
    if (role === "ADMIN") return "Admin";
    return "Employee";
  };

const handleRoleChange = async (userId, newRole) => {
  try {
    setUpdatingUserId(userId);
setRoleMessage("");
setRoleMessageType("");

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8080/api/admin/users/${userId}/role`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: newRole,
        }),
      }
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        message || "Failed to update user role."
      );
    }

    const updatedUser = await response.json();

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === updatedUser.id
          ? updatedUser
          : user
      )
    );

    setRoleMessage(
      `${updatedUser.name}'s role updated to ${formatRole(
        updatedUser.role
      )}.`
    );
setRoleMessageType("success");
  } catch (error) {
    console.error(error);

    setRoleMessage(
      error.message || "Unable to update user role."
    );
    setRoleMessageType("error");
  } finally {
    setUpdatingUserId(null);
  }
};

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="user-management-page">
        <div className="user-management-header">
          <div>
            <p className="user-management-eyebrow">
              ADMINISTRATION
            </p>

            <h1>User Management</h1>

            <p>
              Manage HelpDesk users and their access roles.
            </p>
          </div>

          <div className="user-total">
            <span>Total Users</span>
            <strong>
  {loading || error ? "—" : users.length}
</strong>
          </div>
        </div>

{roleMessage && (
  <div
    className={`role-update-message ${roleMessageType}`}
  >
    {roleMessage}
  </div>
)}

        <div className="users-card">
          <div className="users-card-header">
            <div>
              <h2>Users</h2>
              <p>
                Accounts registered in the HelpDesk system.
              </p>
            </div>
          </div>

          {loading && (
            <div className="users-state">
              Loading users...
            </div>
          )}

          {!loading && error && (
  <div className="users-error-state">

    <div className="users-error-icon">
      !
    </div>

    <div>
      <strong>Unable to load users</strong>

      <p>
        We couldn't retrieve the registered users.
        Please check your connection and try again.
      </p>

      <button
        type="button"
        className="users-retry-button"
        onClick={fetchUsers}
      >
        Try Again
      </button>
    </div>

  </div>
)}

          {!loading && !error && users.length === 0 && (
            <div className="users-state">
              No users found.
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const isCurrentUser =
                      user.id === currentUser?.id;

                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="user-name-cell">
                            <div className="user-avatar">
                              {user.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>{user.name}</strong>

                              {isCurrentUser && (
                                <span className="you-label">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="user-email">
                          {user.email}
                        </td>

                        <td>
  {isCurrentUser ? (
    <div className="current-role">
      <span
        className={`role-badge ${user.role?.toLowerCase()}`}
      >
        {formatRole(user.role)}
      </span>

      <span className="role-locked">
        🔒
      </span>
    </div>
  ) : (
    <select
      className={`role-select ${user.role?.toLowerCase()}`}
      value={user.role}
      disabled={updatingUserId === user.id}
      onChange={(event) =>
        handleRoleChange(
          user.id,
          event.target.value
        )
      }
    >
      <option value="EMPLOYEE">
        Employee
      </option>

      <option value="IT_SUPPORT">
        IT Support
      </option>

      <option value="ADMIN">
        Admin
      </option>
    </select>
  )}
</td>

                        <td className="joined-date">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UserManagement;
