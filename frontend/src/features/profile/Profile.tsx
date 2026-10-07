import { memo, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Camera } from "lucide-react";

import { useAppSelector, useAppDispatch } from "../../app/hook";
import { updateUser } from "../auth/authSlice";
import { api } from "../../api/client";
import UserNavbar from "../../components/layout/UserNavbar";

import Galaxy from "@/components/effects/Galaxy";
import { MagicCard } from "@/components/ui/magic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GALAXY_FOCAL = [0.5, 0.5] as const;
const GALAXY_ROTATION = [1.0, 0.0] as const;

/* Memoized so typing in the edit form (which re-renders Profile) never touches the Galaxy canvas. */
const GalaxyBackground = memo(function GalaxyBackground({
  animated,
}: {
  animated: boolean;
}) {
  return (
    <Galaxy
      focal={GALAXY_FOCAL}
      rotation={GALAXY_ROTATION}
      starSpeed={0.4}
      density={0.9}
      hueShift={140}
      saturation={0}
      glowIntensity={0.25}
      twinkleIntensity={0.3}
      rotationSpeed={0.04}
      speed={0.8}
      mouseRepulsion={false}
      mouseInteraction={animated}
      disableAnimation={!animated}
      transparent
    />
  );
});

function ProfileAvatar({
  src,
  initial,
  onChangeClick,
}: {
  src: string | null;
  initial: string;
  onChangeClick?: () => void;
}) {
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);

  return (
    <div className="relative size-24 shrink-0 sm:size-28">
      <div className="size-full overflow-hidden rounded-full shadow-lg shadow-black/40 ring-1 ring-white/15">
        {src && brokenSrc !== src ? (
          <img
            src={src}
            alt="Profile"
            draggable={false}
            onError={() => setBrokenSrc(src)}
            className="size-full object-cover select-none"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center bg-[#9E7AFF]/20 font-serif text-3xl text-white sm:text-4xl"
          >
            {initial}
          </span>
        )}
      </div>

      {onChangeClick && (
        <button
          type="button"
          onClick={onChangeClick}
          aria-label="Choose a new profile image"
          className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
        >
          <Camera aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
}

function Profile() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const reduceMotion = useReducedMotion();

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(image);

    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [image]);

  if (!user) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#09090B] text-sm text-zinc-400">
        No user found
      </main>
    );
  }

  const displayName = user.name?.trim() || user.email || "";
  const initial = displayName.charAt(0).toUpperCase() || "?";

  const clearImageSelection = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = () => {
    setName(user.name);
    setEmail(user.email);
    setError("");
    setEditMode(true);
  };

  const handleCancel = () => {
    clearImageSelection();
    setError("");
    setEditMode(false);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Name cannot be empty");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (trimmedName.length > 50) {
      setError("Name must be 50 characters or less");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.put(
        "/api/auth/profile",
        {
          name,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = response.data;

      dispatch(updateUser(data.user));
      setEditMode(false);
    } catch (error) {
      console.error("Profile update failed:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      setError("Please select an image first");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("image", image);

      const response = await api.put("/api/auth/profile/image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      dispatch(
        updateUser({
          ...user,
          profileImage: data.profileImage,
        }),
      );

      clearImageSelection();
    } catch (error) {
      console.error("Image upload failed:", error);
      setError("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = imagePreview || user.profileImage || null;

  return (
    <div
      style={{
        position: "relative",
        isolation: "isolate",
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "#09090B",
      }}
    >
      <div
        aria-hidden="true"
        className="opacity-70 sm:opacity-90"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <GalaxyBackground animated={!reduceMotion} />
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom, transparent 40%, rgba(9,9,11,0.75) 100%)",
        }}
      />

      <UserNavbar />

      <main
        style={{
          position: "relative",
          zIndex: 10,
          flex: "1 1 0%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px 16px 32px",
          pointerEvents: "none",
        }}
      >
        <motion.div
          className="w-full max-w-sm"
          style={{ pointerEvents: "auto" }}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
        >
          <MagicCard>
            <motion.div
              key={editMode ? "edit" : "view"}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-5 p-6 text-center sm:p-8"
            >
              {editMode ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSave();
                  }}
                  className="flex w-full flex-col items-center gap-5"
                >
                  <ProfileAvatar
                    src={avatarSrc}
                    initial={initial}
                    onChangeClick={() => fileInputRef.current?.click()}
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (!file) return;

                      if (!file.type.startsWith("image/")) {
                        setError("Please select an image file");
                        e.target.value = "";
                        return;
                      }

                      setError("");
                      setImage(file);
                    }}
                  />

                  {image && (
                    <div className="flex w-full flex-col items-center gap-2">
                      <p
                        className="w-full truncate text-xs text-zinc-400"
                        title={image.name}
                      >
                        Selected: {image.name}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleImageUpload}
                        disabled={loading || !image}
                      >
                        {loading ? "Uploading..." : "Upload Image"}
                      </Button>
                    </div>
                  )}

                  <div className="flex w-full flex-col gap-3.5 text-left">
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="profile-name"
                        className="text-[13px] text-zinc-200"
                      >
                        Name
                      </Label>
                      <Input
                        id="profile-name"
                        value={name}
                        required
                        minLength={2}
                        maxLength={50}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        className="h-10 border-zinc-800 bg-zinc-950 text-white"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="profile-email"
                        className="text-[13px] text-zinc-200"
                      >
                        Email
                      </Label>
                      <Input
                        id="profile-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                        className="h-10 border-zinc-800 bg-zinc-950 text-white"
                      />
                    </div>
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="w-full rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-left text-xs text-red-300"
                    >
                      {error}
                    </p>
                  )}

                  <div className="flex w-full gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <ProfileAvatar src={avatarSrc} initial={initial} />

                  <div className="flex w-full min-w-0 flex-col gap-1">
                    <h1
                      className="truncate font-serif text-2xl font-normal tracking-tight text-zinc-100 sm:text-3xl"
                      title={user.name}
                    >
                      {user.name}
                    </h1>
                    <p
                      className="truncate text-sm text-zinc-400"
                      title={user.email}
                    >
                      {user.email}
                    </p>
                  </div>

                  <Button type="button" onClick={handleEdit} className="w-full">
                    Edit Profile
                  </Button>
                </>
              )}
            </motion.div>
          </MagicCard>
        </motion.div>
      </main>
    </div>
  );
}

export default Profile;
