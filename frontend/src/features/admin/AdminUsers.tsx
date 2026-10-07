import { useEffect, useState } from "react";
import {
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";

import { useAppSelector } from "../../app/hook";
import AdminNavbar from "../../components/layout/AdminNavbar";
import { api } from "../../api/client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  profileImage?: string | null;
  createdAt?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "Name is required";
  }

  if (trimmedName.length < 2) {
    return "Name must be at least 2 characters";
  }

  if (trimmedName.length > 50) {
    return "Name must be 50 characters or less";
  }

  return "";
}

function validateEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return "Email is required";
  }

  if (!emailRegex.test(normalizedEmail)) {
    return "Enter a valid email address";
  }

  return "";
}

function useRetained<T>(value: T | null) {
  const [last, setLast] = useState<T | null>(value);
  if (value !== null && value !== last) setLast(value);
  return value ?? last;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const selectClass =
  "h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent px-2.5 py-1 pr-8 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30 [&>option]:bg-popover [&>option]:text-popover-foreground";

function RoleSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: "user" | "admin";
  onChange: (role: "user" | "admin") => void;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as "user" | "admin")}
        className={selectClass}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

function UserInitial({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#9E7AFF]/20 text-xs font-medium text-white ring-1 ring-[#9E7AFF]/30"
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function RoleBadge({ role }: { role: "user" | "admin" }) {
  return (
    <span
      className={
        role === "admin"
          ? "inline-flex items-center rounded-full border border-[#9E7AFF]/30 bg-[#9E7AFF]/10 px-2 py-0.5 text-xs font-medium text-[#c9b8ff]"
          : "inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground"
      }
    >
      {role === "admin" ? "Admin" : "User"}
    </span>
  );
}

function RowActions({
  user,
  onEdit,
  onDelete,
  className,
}: {
  user: AdminUser;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className={className} />}
      >
        <MoreHorizontalIcon />
        <span className="sr-only">Actions for {user.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <PencilIcon />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdminUsers() {
  const token = useAppSelector((state) => state.adminAuth.token);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  const [creating, setCreating] = useState(false);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [updating, setUpdating] = useState(false);

  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchUsers = async () => {
        if (!token) {
          setError("Authentication required");
          return;
        }

        try {
          setLoading(true);
          setError("");

          const response = await api.get<{ users: AdminUser[] }>(
            `/api/admin/users?search=${encodeURIComponent(search)}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          setUsers(response.data.users);
        } catch (error) {
          console.error("Failed to fetch users:", error);
          setError("Could not load users");
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [token, search]);

  const handleCreateUser = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await api.post<{ user: AdminUser }>(
        "/api/admin/users",
        {
          name,
          email,
          password,
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = response.data;

      setUsers((prevUsers) => [data.user, ...prevUsers]);

      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to create user:", error);
      setError("Could not create user");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateUser = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingUser) {
      return;
    }

    const nameError = validateName(editingUser.name);
    if (nameError) {
      setError(nameError);
      return;
    }

    const emailError = validateEmail(editingUser.email);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (!token) {
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const response = await api.put<{ user: AdminUser }>(
        `/api/admin/users/${editingUser.id}`,
        {
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = response.data;

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === data.user.id ? data.user : user)),
      );

      setEditingUser(null);
    } catch (error) {
      console.error("Failed to update user:", error);
      setError("Could not update user");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!token || !deletingUser) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await api.delete(`/api/admin/users/${deletingUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== deletingUser.id),
      );

      setDeletingUser(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      setError("Could not delete user");
    } finally {
      setDeleting(false);
    }
  };

  const editView = useRetained(editingUser);
  const deleteView = useRetained(deletingUser);

  const dialogErrorMessage = error ? (
    <p role="alert" className="text-center text-sm text-destructive">
      {error}
    </p>
  ) : null;

  const dialogClass = "max-h-[calc(100dvh-2rem)] overflow-y-auto";

  return (
    <>
      <AdminNavbar />

      <div className="px-4 pt-8 pb-16 lg:px-6">
        <main className="mx-auto w-full max-w-4xl">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Users
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Manage users and their access.
            </p>
          </header>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <InputGroup className="min-w-0 sm:max-w-md">
              <InputGroupInput
                type="text"
                placeholder="Search users..."
                aria-label="Search users"
                autoComplete="off"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end" className="shrink-0">
                <span
                  aria-live="polite"
                  className="text-xs whitespace-nowrap tabular-nums"
                >
                  {users.length} {users.length === 1 ? "user" : "users"}
                </span>
              </InputGroupAddon>
            </InputGroup>

            <Button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full sm:w-auto"
            >
              <PlusIcon data-icon="inline-start" />
              Add User
            </Button>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          {!error && (
            <section
              aria-busy={loading}
              className="mt-4 overflow-hidden rounded-xl border border-border bg-card"
            >
              {!loading && users.length === 0 ? (
                <div className="px-4 py-16 text-center">
                  <p className="text-sm font-medium">No users found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try a different search or add a new user.
                  </p>
                </div>
              ) : (
                <div
                  className={
                    loading
                      ? "opacity-60 transition-opacity"
                      : "transition-opacity"
                  }
                >
                  {/* Tablet / desktop */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="px-4 text-xs text-muted-foreground">
                            User
                          </TableHead>
                          <TableHead className="px-4 text-xs text-muted-foreground">
                            Email
                          </TableHead>
                          <TableHead className="px-4 text-xs text-muted-foreground">
                            Role
                          </TableHead>
                          <TableHead className="hidden px-4 text-xs text-muted-foreground lg:table-cell">
                            Created
                          </TableHead>
                          <TableHead className="w-14 px-4 text-right">
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <UserInitial name={user.name} />
                                <span className="max-w-36 truncate font-medium lg:max-w-56">
                                  {user.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-muted-foreground">
                              <div className="max-w-48 truncate lg:max-w-xs xl:max-w-md">
                                {user.email}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <RoleBadge role={user.role} />
                            </TableCell>
                            <TableCell className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                              {formatDate(user.createdAt)}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right">
                              <RowActions
                                user={user}
                                onEdit={() => setEditingUser(user)}
                                onDelete={() => setDeletingUser(user)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile: compact list */}
                  <ul className="divide-y divide-border md:hidden">
                    {users.map((user) => (
                      <li
                        key={user.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <UserInitial name={user.name} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium">
                              {user.name}
                            </p>
                            <RoleBadge role={user.role} />
                          </div>
                          <p className="truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          {user.createdAt && (
                            <p className="mt-0.5 text-xs text-muted-foreground/70">
                              Created {formatDate(user.createdAt)}
                            </p>
                          )}
                        </div>
                        <RowActions
                          user={user}
                          className="size-10"
                          onEdit={() => setEditingUser(user)}
                          onDelete={() => setDeletingUser(user)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* Add user */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto p-4 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              Create a new account and choose their role.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="add-user-name">Name</Label>
              <Input
                id="add-user-name"
                type="text"
                placeholder="Name"
                required
                minLength={2}
                maxLength={50}
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-user-email">Email</Label>
              <Input
                id="add-user-email"
                type="email"
                placeholder="Email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-user-password">Password</Label>
              <Input
                id="add-user-password"
                type="password"
                placeholder="Password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-user-role">Role</Label>
              <RoleSelect id="add-user-role" value={role} onChange={setRole} />
            </div>

            {dialogErrorMessage}

            <DialogFooter className="-mx-4 -mb-4 rounded-b-xl border-t bg-muted/50 p-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit user */}
      <Dialog
        open={editingUser !== null}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto p-4 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update this user's details and access.
            </DialogDescription>
          </DialogHeader>

          {editView && (
            <form onSubmit={handleUpdateUser} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-user-name">Name</Label>
                <Input
                  id="edit-user-name"
                  required
                  minLength={2}
                  maxLength={50}
                  value={editView.name}
                  onChange={(e) =>
                    editingUser &&
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-user-email">Email</Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  required
                  value={editView.email}
                  onChange={(e) =>
                    editingUser &&
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-user-role">Role</Label>
                <RoleSelect
                  id="edit-user-role"
                  value={editView.role}
                  onChange={(nextRole) =>
                    editingUser &&
                    setEditingUser({ ...editingUser, role: nextRole })
                  }
                />
              </div>

              {dialogErrorMessage}

              <DialogFooter className="-mx-4 -mb-4 rounded-b-xl border-t bg-muted/50 p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete user */}
      <AlertDialog
        open={deletingUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null);
        }}
      >
        <AlertDialogContent size="sm" className={dialogClass}>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="font-medium text-foreground wrap-break-word">
                {deleteView?.name}
              </strong>
              ? This user will be permanently deleted. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {dialogErrorMessage}

          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default AdminUsers;
