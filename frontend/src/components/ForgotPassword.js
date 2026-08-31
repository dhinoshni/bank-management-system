import "./login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (!newPassword) {
      alert("Please enter a new password");
      return;
    }

    if (!confirmPassword) {
      alert("Please confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/forgot-password", {
        email: email.trim(),
        new_password: newPassword
      });

      if (res.data.status === "success") {
        alert("Password reset successfully! 🎉");

        setEmail("");
        setNewPassword("");
        setConfirmPassword("");

        navigate("/");
      } else {
        alert(res.data.message || "Password reset failed");
      }

    } catch (err) {
      console.log(err);

      if (err.response) {
        alert(
          err.response.data.message ||
          "Password reset failed"
        );
      } else {
        alert("Unable to connect to server");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-box">

        <h2>Forgot Password</h2>

        <form
          onSubmit={handleResetPassword}
          autoComplete="off"
        >

          <input
            type="email"
            name="reset-email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            required
          />

          <input
            type="password"
            name="new-password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <input
            type="password"
            name="confirm-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            autoComplete="new-password"
            required
          />

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

        </form>

        <p className="signup">
          Remember your password?{" "}
          <span onClick={() => navigate("/")}>
            Back to Login
          </span>
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;