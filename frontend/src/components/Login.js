import "./login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (!password.trim()) {
      alert("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/login", {
        email: email.trim(),
        password
      });

      if (res.data.status === "success") {
        alert("Login successful 🎉");

        // Save logged-in user
        localStorage.setItem(
          "user",
          JSON.stringify(res.data.data)
        );

        // Save token only if backend provides one
        if (res.data.data.token) {
          localStorage.setItem(
            "token",
            res.data.data.token
          );
        }

        navigate("/dashboard");
      } else {
        alert(res.data.message || "Login failed");
      }
    } catch (err) {
      console.log(err);

      if (err.response) {
        alert(
          err.response.data.message ||
          "Invalid email or password"
        );
      } else {
        alert("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-box">

        <h2>Login</h2>

        <form onSubmit={handleLogin} autoComplete="off">

          <input
            type="email"
            name="login-email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            required
          />

          <input
            type="password"
            name="login-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <p
            className="forgot"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </p>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="signup">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>
            Create New
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;