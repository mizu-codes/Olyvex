import { useEffect, useState } from "react";
import { useAppSelector } from "../../app/hook";
import AdminNavbar from "../../components/AdminNavbar";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  profileImage?: string | null;
  createdAt?: string;
}

function AdminUsers() {
  const token = useAppSelector((state) => state.adminAuth.token);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showAddForm, setShowAddForm] = useState(false)

const [name, setName] = useState("")
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [role, setRole] = useState<"user" | "admin">("user")

const [creating, setCreating] = useState(false)

const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
const [updating, setUpdating] = useState(false)

const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)
const [deleting, setDeleting] = useState(false)

useEffect(() => {
  const timeoutId = setTimeout(() => {
    const fetchUsers = async () => {
      if (!token) {
        setError("Authentication required")
        return
      }

      try {
        setLoading(true)
        setError("")

        const response = await fetch(
          `http://localhost:5000/api/admin/users?search=${encodeURIComponent(search)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setError(data.message)
          return
        }

        setUsers(data.users)
      } catch (error) {
        console.error("Failed to fetch users:", error)
        setError("Could not load users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, 300)

  return () => {
    clearTimeout(timeoutId)
  }
}, [token, search])

const handleCreateUser = async ( e: React.SubmitEvent<HTMLFormElement> ) => {
  e.preventDefault()

  if (!token) {
    setError("Authentication required")
    return
  }

  try {
    setCreating(true)
    setError("")

    const response = await fetch(
      "http://localhost:5000/api/admin/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      setError(data.message)
      return
    }

    setUsers((prevUsers) => [data.user, ...prevUsers])

    setName("")
    setEmail("")
    setPassword("")
    setRole("user")
    setShowAddForm(false)
  } catch (error) {
    console.error("Failed to create user:", error)
    setError("Could not create user")
  } finally {
    setCreating(false)
  }
}
  
const handleUpdateUser = async ( e: React.SubmitEvent<HTMLFormElement> ) => {
  e.preventDefault()

  if (!token || !editingUser) {
    return
  }

  try {
    setUpdating(true)
    setError("")

    const response = await fetch(
      `http://localhost:5000/api/admin/users/${editingUser.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      setError(data.message)
      return
    }

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === data.user.id ? data.user : user
      )
    )

    setEditingUser(null)
  } catch (error) {
    console.error("Failed to update user:", error)
    setError("Could not update user")
  } finally {
    setUpdating(false)
  }
}

const handleDeleteUser = async () => {
  if (!token || !deletingUser) {
    return
  }

  try {
    setDeleting(true)
    setError("")

    const response = await fetch(
      `http://localhost:5000/api/admin/users/${deletingUser.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      setError(data.message)
      return
    }

    setUsers((prevUsers) =>
      prevUsers.filter((user) => user.id !== deletingUser.id)
    )

    setDeletingUser(null)
  } catch (error) {
    console.error("Failed to delete user:", error)
    setError("Could not delete user")
  } finally {
    setDeleting(false)
  }
}

  return (
    <>
      <AdminNavbar />

      <h1>Admin Users</h1>

      <button onClick={() => setShowAddForm(true)}>
  Add User
</button>

{showAddForm && (
  <form onSubmit={handleCreateUser}>
    <input
      type="text"
      placeholder="Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <select
      value={role}
      onChange={(e) =>
        setRole(e.target.value as "user" | "admin")
      }
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>

    <button type="submit" disabled={creating}>
  {creating ? "Creating..." : "Create User"}
</button>

    <button
      type="button"
      onClick={() => setShowAddForm(false)}
    >
      Cancel
    </button>
  </form>
)}

      <br /><input
        type="text"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>Loading users...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && users.length === 0 && <p>No users found</p>}

      {editingUser && (
        <form onSubmit={handleUpdateUser}>
    <h2>Edit User</h2>

    <input
      value={editingUser.name}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          name: e.target.value,
        })
      }
    />

    <input
      value={editingUser.email}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          email: e.target.value,
        })
      }
    />

    <select
      value={editingUser.role}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          role: e.target.value as "user" | "admin",
        })
      }
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>

    <button type="submit" disabled={updating}>
  {updating ? "Saving..." : "Save"}
</button>

    <button type="button" onClick={() => setEditingUser(null)}>Cancel</button>
    
    </form>
)}

{deletingUser && (
  <div>
    <h2>Delete User</h2>

    <p>
      Are you sure you want to delete{" "}
      <strong>{deletingUser.name}</strong>?
    </p>

    <button
      type="button"
      onClick={() => setDeletingUser(null)}
    >
      Cancel
    </button>

    <button
  type="button"
  onClick={handleDeleteUser}
  disabled={deleting}
>
  {deleting ? "Deleting..." : "Delete"}
</button>
  </div>
)}

      {!error &&
        users.map((user) => (
          <div key={user.id}>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>

            <button onClick={() => setEditingUser(user)}>Edit</button>

            <button onClick={() => setDeletingUser(user)}>Delete</button>

            <hr />
          </div>
        ))}
    </>
  );
}

export default AdminUsers;
