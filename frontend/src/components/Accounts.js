import "./accounts.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Accounts() {

  const navigate = useNavigate();

  const [accountData, setAccountData] = useState({
    accountNumber: "",
    ifsc: "",
    bankName: "",
    accountType: "Savings",
    branch: "",
    balance: ""
  });

  const [isEditing, setIsEditing] = useState(true);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setAccountData({
      ...accountData,
      [e.target.name]: e.target.value
    });
  };

  // SAVE BUTTON
  const handleSave = () => {

    if (
      accountData.accountNumber === "" ||
      accountData.ifsc === "" ||
      accountData.bankName === "" ||
      accountData.branch === "" ||
      accountData.balance === ""
    ) {

      alert("Please fill all account details");

      return;
    }

    alert("Account details saved successfully");

    setIsEditing(false);
  };

  // EDIT BUTTON
  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="accounts-container">

      {/* TOP HEADER */}
      <div className="top-header">

        <button
          className="top-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ❮
        </button>

        <h2>Account Details</h2>

      </div>

      {/* ACCOUNT CARD */}
      <div className="account-card">

        <h3>Account Information</h3>

        {/* ACCOUNT NUMBER */}
        <div className="form-group">

          <label>Account Number</label>

          <input
            type="text"
            name="accountNumber"
            value={accountData.accountNumber}
            onChange={handleChange}
            disabled={!isEditing}
          />

        </div>

        {/* IFSC */}
        <div className="form-group">

          <label>IFSC Code</label>

          <input
            type="text"
            name="ifsc"
            value={accountData.ifsc}
            onChange={handleChange}
            disabled={!isEditing}
          />

        </div>

        {/* BANK NAME */}
        <div className="form-group">

          <label>Bank Name</label>

          <input
            type="text"
            name="bankName"
            value={accountData.bankName}
            onChange={handleChange}
            disabled={!isEditing}
          />

        </div>

        {/* ACCOUNT TYPE */}
        <div className="form-group">

          <label>Account Type</label>

          <select
            name="accountType"
            value={accountData.accountType}
            onChange={handleChange}
            disabled={!isEditing}
          >
            <option>Savings</option>
            <option>Current</option>
          </select>

        </div>

        {/* BRANCH */}
        <div className="form-group">

          <label>Branch</label>

          <input
            type="text"
            name="branch"
            value={accountData.branch}
            onChange={handleChange}
            disabled={!isEditing}
          />

        </div>

        {/* BALANCE */}
        <div className="form-group">

          <label>Balance</label>

          <input
            type="text"
            name="balance"
            value={accountData.balance}
            onChange={handleChange}
            disabled={!isEditing}
          />

        </div>

        {/* BUTTONS */}
        <div className="button-group">

          <button
            className="save-btn"
            onClick={handleSave}
          >
            Save
          </button>

          <button
            className="edit-btn"
            onClick={handleEdit}
          >
            Edit
          </button>

        </div>

      </div>

    </div>
  );
}

export default Accounts;