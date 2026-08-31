import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Accounts from "./components/Accounts";
import Transactions from "./components/Transactions";
import Register from "./components/Register";
import Transfer from "./components/Transfer";
import Deposit from "./components/Deposit";
import TransferSuccess from "./components/TransferSuccess";
import Withdraw from "./components/Withdraw";
import Profile from "./components/Profile";
import ForgotPassword from "./components/ForgotPassword";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={<Login />}
        />
        {/* FORGOT PASSWORD */}
          <Route
          path="/forgot-password"
          element={<ForgotPassword />}
            />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* ACCOUNTS */}
        <Route
          path="/accounts"
          element={<Accounts />}
        />

        {/* TRANSACTION HISTORY */}
        <Route
          path="/transactions"
          element={<Transactions />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* TRANSFER */}
        <Route
          path="/transfer"
          element={<Transfer />}
        />

        {/* DEPOSIT */}
        <Route
          path="/deposit"
          element={<Deposit />}
        />

        {/* TRANSFER SUCCESS */}
        <Route
          path="/transfer-success"
          element={<TransferSuccess />}
        />

        {/* WITHDRAW */}
        <Route
          path="/withdraw"
          element={<Withdraw />}
        />
        <Route path="/profile" element={<Profile />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;