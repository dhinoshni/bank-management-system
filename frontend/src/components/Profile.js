import "./profile.css";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // =====================================================
  // GET USER ID
  // =====================================================

  const getUserId = () => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user")
      );

      return storedUser?.user_id || null;
    } catch (error) {
      console.error("User data error:", error);
      return null;
    }
  };

  // =====================================================
  // FETCH PROFILE
  // =====================================================

  const fetchProfile = useCallback(async () => {
    const userId = getUserId();

    if (!userId) {
      alert("Session expired. Please login again.");
      localStorage.clear();
      navigate("/");
      return;
    }

    try {
      setLoading(true);

      const res = await API.get(
        `/users/${userId}`
      );

      if (res.data?.status === "success") {
        setProfile({
          name: res.data.data?.name || "",
          email: res.data.data?.email || "",
          phone: res.data.data?.phone || ""
        });
      } else {
        alert(
          res.data?.message ||
          "Unable to load profile."
        );
      }

    } catch (error) {
      console.error(
        "Profile fetch error:",
        error
      );

      if (error.response?.status === 401) {
        alert(
          "Session expired. Please login again."
        );

        localStorage.clear();
        navigate("/");
        return;
      }

      alert(
        error.response?.data?.message ||
        "Unable to load profile."
      );

    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value
    }));
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async () => {
    const userId = getUserId();

    if (!userId) {
      alert("Session expired. Please login again.");
      localStorage.clear();
      navigate("/");
      return;
    }

    const name = profile.name.trim();
    const phone = profile.phone.trim();

    if (!name) {
      alert("Name cannot be empty.");
      return;
    }

    if (!phone) {
      alert("Phone number cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      const res = await API.put(
        `/users/${userId}`,
        {
          name,
          phone
        }
      );

      if (res.data?.status === "success") {

        // Keep localStorage user name updated
        try {
          const storedUser = JSON.parse(
            localStorage.getItem("user")
          );

          if (storedUser) {
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...storedUser,
                name
              })
            );
          }
        } catch (error) {
          console.error(
            "Local user update error:",
            error
          );
        }

        setProfile((previousProfile) => ({
          ...previousProfile,
          name,
          phone
        }));

        setEditing(false);

        alert(
          "Profile updated successfully."
        );

      } else {
        alert(
          res.data?.message ||
          "Unable to update profile."
        );
      }

    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      if (error.response?.status === 401) {
        alert(
          "Session expired. Please login again."
        );

        localStorage.clear();
        navigate("/");
        return;
      }

      alert(
        error.response?.data?.message ||
        "Unable to update profile."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancel = () => {
    setEditing(false);
    fetchProfile();
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.clear();
    navigate("/");
  };

  // =====================================================
  // DELETE ACCOUNT
  // =====================================================

  const handleDeleteAccount = async () => {
    const userId = getUserId();

    if (!userId) {
      alert("Session expired. Please login again.");
      localStorage.clear();
      navigate("/");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete your account?\n\nThis action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      const res = await API.delete(
        `/users/${userId}`
      );

      if (res.data?.status === "success") {
        alert(
          "Account deleted successfully."
        );

        localStorage.clear();
        navigate("/");

      } else {
        alert(
          res.data?.message ||
          "Unable to delete account."
        );
      }

    } catch (error) {
      console.error(
        "Delete account error:",
        error
      );

      if (error.response?.status === 401) {
        alert(
          "Session expired. Please login again."
        );

        localStorage.clear();
        navigate("/");
        return;
      }

      alert(
        error.response?.data?.message ||
        "Unable to delete account."
      );
    }
  };

  // =====================================================
  // UI
  // =====================================================

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p className="profile-loading">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* HEADER */}

      <div className="profile-header">

        <button
          type="button"
          className="profile-back-btn"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ←
        </button>

        <h1>My Profile</h1>

      </div>


      {/* PROFILE CARD */}

      <div className="profile-card">

        {/* PROFILE ICON */}

        <div className="profile-avatar">
          👤
        </div>

        <h2>
          {profile.name || "User"}
        </h2>

        <p className="profile-subtitle">
          Manage your personal information
        </p>


        {/* NAME */}

        <div className="profile-field">

          <label>Name</label>

          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Enter your name"
          />

        </div>


        {/* EMAIL */}

        <div className="profile-field">

          <label>Email</label>

          <input
            type="email"
            name="email"
            value={profile.email}
            disabled
          />

          <small>
            Email cannot be changed.
          </small>

        </div>


        {/* PHONE */}

        <div className="profile-field">

          <label>Phone Number</label>

          <input
            type="tel"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Enter phone number"
          />

        </div>


        {/* BUTTONS */}

        <div className="profile-buttons">

          {!editing ? (

            <button
              type="button"
              className="profile-edit-btn"
              onClick={() =>
                setEditing(true)
              }
            >
              Edit Profile
            </button>

          ) : (

            <>
              <button
                type="button"
                className="profile-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </>

          )}

        </div>


        {/* ACCOUNT ACTIONS */}

        <div className="profile-actions">

          <button
            type="button"
            className="profile-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

          <button
            type="button"
            className="profile-delete-btn"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>

        </div>

      </div>

    </div>
  );
}

export default Profile;