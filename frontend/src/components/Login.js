import "./login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

function Login() {

  const navigate = useNavigate();

  // ✅ State for inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Login API
  const handleLogin = async () => {
    try {
      const res = await API.post("/login", {
        email,
        password
      });

      console.log(res.data);

      if (res.data.status === "success") {
        alert("Login successful 🎉");

        // Save user (optional)
        localStorage.setItem("user", JSON.stringify(res.data.data));

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        alert(res.data.message);
      }

    } catch (err) {
      console.log(err);

      if (err.response) {
        alert(err.response.data.message);
      } else {
        alert("Server error");
      }
    }
  };

  return (
    <div className="container">
      <div className="login-box">

        <h2>Login</h2>

        <input
          type="text"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <p
          className="forgot"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </p>

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

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