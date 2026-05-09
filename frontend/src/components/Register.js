import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./login.css";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await API.post("/users", {
        name,
        email,
        password,
        phone
      });

      alert("User created successfully 🎉");

      navigate("/"); // back to login
    } catch (err) {
  console.log(err);              // 👈 ADD THIS
  console.log(err.response);     // 👈 ADD THIS
  alert("Error creating user");

    }
  };

  return (
    <div className="container">
      <div className="login-box">

        <h2>Create Account</h2>

        <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <input placeholder="Phone Number" onChange={(e) => setPhone(e.target.value)} />

        <button className="login-btn" onClick={handleRegister}>
          Create Account
        </button>

        <p className="signup">
          Already have an account?
          <span onClick={() => navigate("/")}> Login</span>
        </p>

      </div>
    </div>
  );
 
}

export default Register;