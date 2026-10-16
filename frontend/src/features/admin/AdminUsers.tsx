import { useEffect, useState } from "react";
import axios from "axios";
import {
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  Eye,
  EyeOff,
} from "lucide-react";

import { useAppSelector } from "../../app/hook";
import AdminNavbar from "../../components/layout/AdminNavbar";
import { api } from "../../api/client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAdminUserSchema,
  type CreateAdminUserFormValues,
  updateAdminUserSchema,
  type UpdateAdminUserFormValues,
} from "./adminUserSchemas";

import { Spinner } from "@/components/ui/spinner";

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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { toast } from "@/lib/toast";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  profileImage?: string | null;
  createdAt?: string;
}
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];

  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];

    if (previous !== undefined) {
      const gap = page - previous;

      if (gap === 2) {
        items.push(previous + 1);
      } else if (gap > 2) {
        items.push(previous === 1 ? "ellipsis-start" : "ellipsis-end");
      }
    }

    items.push(page);
  });

  return items;
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

function PageSizeSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number;
  onChange: (size: number) => void;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-18 appearance-none rounded-md border border-input bg-transparent pr-7 pl-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 [&>option]:bg-popover [&>option]:text-popover-foreground"
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-muted-foreground"
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

  const {
    register: registerAdd,
    handleSubmit: handleAddSubmit,
    reset: resetAdd,
    control: addControl,
    formState: { errors: addErrors, isSubmitting: isCreating },
  } = useForm<CreateAdminUserFormValues>({
    resolver: zodResolver(createAdminUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
    mode: "onTouched",
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    control: editControl,
    formState: { errors: editErrors, isSubmitting: isUpdating },
  } = useForm<UpdateAdminUserFormValues>({
    resolver: zodResolver(updateAdminUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
    },
    mode: "onTouched",
  });

  const openEditUser = (user: AdminUser) => {
    resetEdit({
      name: user.name,
      email: user.email,
      role: user.role,
    });

    setEditingUser(user);
  };

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: PAGE_SIZE_OPTIONS[0],
    total: 0,
    totalPages: 1,
  });
  const [reloadKey, setReloadKey] = useState(0);

  const [showAddForm, setShowAddForm] = useState(false);

  const [showAddPassword, setShowAddPassword] = useState(false);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        setPage(1);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search, debouncedSearch]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const params = new URLSearchParams({
          search: debouncedSearch,
          page: String(page),
          limit: String(limit),
        });

        const response = await api.get<{
          users: AdminUser[];
          pagination: PaginationInfo;
        }>(`/api/admin/users?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (cancelled) return;

        setUsers(response.data.users);
        setPagination(response.data.pagination);

        if (response.data.pagination.page !== page) {
          setPage(response.data.pagination.page);
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to fetch users:", error);
        setLoadError("Could not load users");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [token, debouncedSearch, page, limit, reloadKey]);

  const handlePageSizeChange = (size: number) => {
    setLimit(size);
    setPage(1);
  };

  const handleCreateUser = async (values: CreateAdminUserFormValues) => {
    if (!token) {
      toast.error(
        "Authentication required",
        "Please sign in again to continue.",
      );
      return;
    }

    try {
      await api.post(
        "/api/admin/users",
        {
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      resetAdd();
      setShowAddForm(false);
      setShowAddPassword(false);
      setPage(1);
      setReloadKey((key) => key + 1);

      toast.success("User created", "The new user was added successfully.");
    } catch (error) {
      console.error("Failed to create user:", error);

      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Could not create user")
        : "Could not create user";

      toast.error("Create failed", message);
    }
  };

  const handleUpdateUser = async (values: UpdateAdminUserFormValues) => {
    if (!editingUser || !token) {
      return;
    }

    try {
      await api.put(
        `/api/admin/users/${editingUser.id}`,
        {
          name: values.name,
          email: values.email,
          role: values.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEditingUser(null);
      setReloadKey((key) => key + 1);

      toast.success("User updated", "The user was updated successfully.");
    } catch (error) {
      console.error("Failed to update user:", error);

      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Could not update user")
        : "Could not update user";

      toast.error("Update failed", message);
    }
  };

  const handleDeleteUser = async () => {
    if (!token || !deletingUser) {
      return;
    }

    try {
      setDeleting(true);

      await api.delete(`/api/admin/users/${deletingUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeletingUser(null);
      setReloadKey((key) => key + 1);
      toast.success("User deleted", "The user was deleted successfully.");
    } catch (error) {
      console.error("Failed to delete user:", error);
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Could not delete user")
        : "Could not delete user";
      toast.error("Delete failed", message);
    } finally {
      setDeleting(false);
    }
  };

  const editView = useRetained(editingUser);
  const deleteView = useRetained(deletingUser);

  const dialogClass = "max-h-[calc(100dvh-2rem)] overflow-y-auto";

  const rangeStart =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const rangeEnd = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );
  const canGoPrevious = pagination.page > 1 && !loading;
  const canGoNext = pagination.page < pagination.totalPages && !loading;
  const pageItems = getPageItems(pagination.page, pagination.totalPages);

  const goToPage = (target: number) => {
    if (target < 1 || target > pagination.totalPages || target === page) {
      return;
    }
    setPage(target);
  };

  const displayedLoadError = token ? loadError : "Authentication required";

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
                  {pagination.total} {pagination.total === 1 ? "user" : "users"}
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

          {displayedLoadError && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {displayedLoadError}
            </p>
          )}

          {!displayedLoadError && (
            <section
              aria-busy={loading}
              className="mt-4 overflow-hidden rounded-xl border border-border bg-card"
            >
              {!loading && users.length === 0 ? (
                <div className="px-4 py-16 text-center">
                  <p className="text-sm font-medium">No users found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {debouncedSearch
                      ? "Try a different search or add a new user."
                      : "Add a new user to get started."}
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
                  {loading && (
                    <div className="flex items-center justify-center py-4">
                      <Spinner className="size-6" />
                    </div>
                  )}

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
                                onEdit={() => openEditUser(user)}
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
                          onEdit={() => openEditUser(user)}
                          onDelete={() => setDeletingUser(user)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pagination.total > 0 && (
                <div className="flex flex-col gap-3 border-t border-border px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 md:justify-start">
                    <p
                      aria-live="polite"
                      className="text-sm whitespace-nowrap text-muted-foreground tabular-nums"
                    >
                      Showing {rangeStart}–{rangeEnd} of {pagination.total}{" "}
                      {pagination.total === 1 ? "user" : "users"}
                    </p>

                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="users-per-page"
                        className="text-sm font-normal whitespace-nowrap text-muted-foreground"
                      >
                        Rows per page
                      </Label>
                      <PageSizeSelect
                        id="users-per-page"
                        value={limit}
                        onChange={handlePageSizeChange}
                      />
                    </div>
                  </div>

                  {pagination.totalPages > 1 && (
                    <Pagination className="mx-0 w-auto justify-center md:justify-end">
                      <PaginationContent className="flex-wrap justify-center">
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            aria-disabled={!canGoPrevious}
                            tabIndex={canGoPrevious ? undefined : -1}
                            className={
                              canGoPrevious
                                ? undefined
                                : "pointer-events-none opacity-50"
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              if (canGoPrevious) goToPage(pagination.page - 1);
                            }}
                          />
                        </PaginationItem>

                        {pageItems.map((item) =>
                          typeof item === "number" ? (
                            <PaginationItem key={item}>
                              <PaginationLink
                                href="#"
                                isActive={item === pagination.page}
                                aria-label={`Page ${item}`}
                                className={
                                  item === pagination.page
                                    ? "border-[#9E7AFF]/30 bg-[#9E7AFF]/10 text-[#c9b8ff] hover:bg-[#9E7AFF]/20 hover:text-white"
                                    : undefined
                                }
                                onClick={(e) => {
                                  e.preventDefault();
                                  goToPage(item);
                                }}
                              >
                                {item}
                              </PaginationLink>
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={item}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ),
                        )}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            aria-disabled={!canGoNext}
                            tabIndex={canGoNext ? undefined : -1}
                            className={
                              canGoNext
                                ? undefined
                                : "pointer-events-none opacity-50"
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              if (canGoNext) goToPage(pagination.page + 1);
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* Add user */}
      <Dialog
        open={showAddForm}
        onOpenChange={(open) => {
          setShowAddForm(open);

          if (!open) {
            resetAdd();
            setShowAddPassword(false);
          }
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto p-4 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              Create a new account and choose their role.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleAddSubmit(handleCreateUser)}
            noValidate
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="add-user-name">Name</Label>

              <Input
                id="add-user-name"
                type="text"
                placeholder="Name"
                autoComplete="off"
                {...registerAdd("name")}
                aria-invalid={Boolean(addErrors.name)}
                aria-describedby={
                  addErrors.name ? "add-user-name-error" : undefined
                }
                className="pr-10 aria-invalid:border-zinc-800 aria-invalid:ring-0 dark:aria-invalid:border-zinc-800 dark:aria-invalid:ring-0"
              />

              {addErrors.name && (
                <p
                  id="add-user-name-error"
                  className="text-xs text-rose-400"
                  role="alert"
                >
                  {addErrors.name.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-user-email">Email</Label>

              <Input
                id="add-user-email"
                type="email"
                placeholder="Email"
                autoComplete="off"
                {...registerAdd("email")}
                aria-invalid={Boolean(addErrors.email)}
                aria-describedby={
                  addErrors.email ? "add-user-email-error" : undefined
                }
                className="pr-10 aria-invalid:border-zinc-800 aria-invalid:ring-0 dark:aria-invalid:border-zinc-800 dark:aria-invalid:ring-0"
              />

              {addErrors.email && (
                <p
                  id="add-user-email-error"
                  className="text-xs text-rose-400"
                  role="alert"
                >
                  {addErrors.email.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-user-password">Password</Label>

              <div className="relative">
                <Input
                  id="add-user-password"
                  type={showAddPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="new-password"
                  {...registerAdd("password")}
                  aria-invalid={Boolean(addErrors.password)}
                  aria-describedby={
                    addErrors.password ? "add-user-password-error" : undefined
                  }
                  className="pr-10 aria-invalid:border-zinc-800 aria-invalid:ring-0 dark:aria-invalid:border-zinc-800 dark:aria-invalid:ring-0"
                />

                <button
                  type="button"
                  onClick={() => setShowAddPassword((prev) => !prev)}
                  aria-label={
                    showAddPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showAddPassword}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showAddPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>

              {addErrors.password && (
                <p
                  id="add-user-password-error"
                  className="text-xs text-rose-400"
                  role="alert"
                >
                  {addErrors.password.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-user-role">Role</Label>

              <Controller
                name="role"
                control={addControl}
                render={({ field }) => (
                  <RoleSelect
                    id="add-user-role"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <DialogFooter className="-mx-4 -mb-4 rounded-b-xl border-t bg-muted/50 p-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetAdd();
                  setShowAddPassword(false);
                  setShowAddForm(false);
                }}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Spinner className="size-4" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
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
            <form
              onSubmit={handleEditSubmit(handleUpdateUser)}
              noValidate
              className="grid gap-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="edit-user-name">Name</Label>

                <Input
                  id="edit-user-name"
                  {...registerEdit("name")}
                  aria-invalid={Boolean(editErrors.name)}
                  aria-describedby={
                    editErrors.name ? "edit-user-name-error" : undefined
                  }
                  className="pr-10 aria-invalid:border-zinc-800 aria-invalid:ring-0 dark:aria-invalid:border-zinc-800 dark:aria-invalid:ring-0"
                />

                {editErrors.name && (
                  <p
                    id="edit-user-name-error"
                    className="text-xs text-rose-400"
                    role="alert"
                  >
                    {editErrors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-user-email">Email</Label>

                <Input
                  id="edit-user-email"
                  type="email"
                  {...registerEdit("email")}
                  aria-invalid={Boolean(editErrors.email)}
                  aria-describedby={
                    editErrors.email ? "edit-user-email-error" : undefined
                  }
                  className="pr-10 aria-invalid:border-zinc-800 aria-invalid:ring-0 dark:aria-invalid:border-zinc-800 dark:aria-invalid:ring-0"
                />

                {editErrors.email && (
                  <p
                    id="edit-user-email-error"
                    className="text-xs text-rose-400"
                    role="alert"
                  >
                    {editErrors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-user-role">Role</Label>

                <Controller
                  name="role"
                  control={editControl}
                  render={({ field }) => (
                    <RoleSelect
                      id="edit-user-role"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <DialogFooter className="-mx-4 -mb-4 rounded-b-xl border-t bg-muted/50 p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Spinner className="size-4" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
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

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              variant="destructive"
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteUser();
              }}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Spinner className="size-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default AdminUsers;
