import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hook";
import { updateUser } from "../auth/authSlice";
import { api } from "../../api/client";

function Profile() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!user) {
    return <p>No user found</p>;
  }

  const handleEdit = () => {
    setName(user.name);
    setEmail(user.email);
    setEditMode(true);
  };

  const handleSave = async () => {
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

      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Image upload failed:", error);
      setError("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>WATCHER TEST</h1>

      {editMode ? (
        <>
          {(imagePreview || user.profileImage) && (
            <img
              src={imagePreview || user.profileImage || ""}
              alt="Profile"
              width="150"
            />
          )}

          <input
            type="file"
            accept="image/*"
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

          {image && <p>Selected: {image.name}</p>}

          <button onClick={handleImageUpload} disabled={loading || !image}>
            {loading ? "Uploading..." : "Upload Image"}
          </button>

          <input value={name} onChange={(e) => setName(e.target.value)} />

          <input value={email} onChange={(e) => setEmail(e.target.value)} />

          {error && <p>{error}</p>}

          <button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>

          <button onClick={() => setEditMode(false)}>Cancel</button>
        </>
      ) : (
        <>
          {user.profileImage && (
            <img src={user.profileImage} alt="Profile" width="150" />
          )}

          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>

          <button onClick={handleEdit}>Edit Profile</button>
        </>
      )}
    </>
  );
}

export default Profile;
