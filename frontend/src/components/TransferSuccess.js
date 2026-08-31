import "./transferSuccess.css";
import { useLocation, useNavigate } from "react-router-dom";

function TransferSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const transfer = location.state;

  // If success page is opened directly
  if (!transfer) {
    return (
      <div className="transfer-success-page">
        <div className="transfer-success-card unavailable-card">
          <h2>Transaction details unavailable</h2>

          <p>
            We could not find the details for this transaction.
          </p>

          <button
            className="success-done-btn"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="transfer-success-page">
      <div className="transfer-success-card">

        {/* SUCCESS ICON */}
        <div className="success-icon">
          ✓
        </div>

        {/* HEADER */}
        <div className="success-header">
          <h1>Transfer Successful</h1>

          <p className="success-subtitle">
            Your money has been transferred successfully.
          </p>
        </div>

        {/* AMOUNT */}
        <div className="success-amount">
          ₹{" "}
          {Number(transfer.amount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>

        {/* TRANSACTION DETAILS */}
        <div className="transaction-details">

          {/* FROM ACCOUNT */}
          <div className="transaction-party">
            <div className="party-label">
              From Account
            </div>

            <div className="party-account">
              {transfer.fromAccount}
            </div>

            <div className="party-name">
              {transfer.fromName || "Account Holder"}
            </div>
          </div>

          {/* TRANSFER DIRECTION */}
          <div className="transfer-arrow">
            ↓
          </div>

          {/* TO ACCOUNT */}
          <div className="transaction-party">
            <div className="party-label">
              To Account
            </div>

            <div className="party-account">
              {transfer.toAccount}
            </div>

            <div className="party-name">
              {transfer.toName || "Account Holder"}
            </div>
          </div>

        </div>

        {/* STATUS */}
        <div className="transaction-status">
          <span>
            Transaction Status
          </span>

          <strong>
            Successful
          </strong>
        </div>

        {/* ACTIONS */}
        <div className="success-actions">

          <button
            className="success-done-btn"
            onClick={() => navigate("/dashboard")}
          >
            Done
          </button>

          <button
            className="view-history-btn"
            onClick={() => navigate("/transactions")}
          >
            View Transaction History
          </button>

        </div>

      </div>
    </div>
  );
}

export default TransferSuccess;