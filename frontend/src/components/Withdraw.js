import "./withdraw.css";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Withdraw() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // =====================================================
  // FETCH LOGGED-IN USER ACCOUNTS
  // =====================================================

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await API.get("/accounts");

      if (res.data?.status === "success") {
        const userAccounts = Array.isArray(res.data.data)
          ? res.data.data
          : [];

        setAccounts(userAccounts);

        // Automatically select the first account
        // only when accounts are available
        if (userAccounts.length > 0) {
          setAccountId(String(userAccounts[0].account_id));
        } else {
          setAccountId("");
        }
      } else {
        setAccounts([]);
        setAccountId("");

        setErrorMessage(
          res.data?.message || "Unable to load accounts."
        );
      }
    } catch (error) {
      console.error("Account fetch error:", error);

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");

        localStorage.clear();
        navigate("/");

        return;
      }

      setErrorMessage(
        error.response?.data?.message ||
        "Unable to load accounts."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // =====================================================
  // LOAD ACCOUNTS WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // =====================================================
  // GET SELECTED ACCOUNT
  // =====================================================

  const selectedAccount = accounts.find(
    (account) =>
      String(account.account_id) === String(accountId)
  );

  // =====================================================
  // HANDLE ACCOUNT CHANGE
  // =====================================================

  const handleAccountChange = (e) => {
    setAccountId(e.target.value);

    setErrorMessage("");
    setSuccessMessage("");
    setAmount("");
  };

  // =====================================================
  // HANDLE AMOUNT CHANGE
  // =====================================================

  const handleAmountChange = (e) => {
    setAmount(e.target.value);

    setErrorMessage("");
    setSuccessMessage("");
  };

  // =====================================================
  // WITHDRAW
  // =====================================================

  const handleWithdraw = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    // -----------------------------------------------------
    // ACCOUNT VALIDATION
    // -----------------------------------------------------

    if (!accountId) {
      setErrorMessage("Please select an account.");
      return;
    }

    // -----------------------------------------------------
    // AMOUNT VALIDATION
    // -----------------------------------------------------

    if (amount.trim() === "") {
      setErrorMessage("Please enter withdrawal amount.");
      return;
    }

    const withdrawAmount = Number(amount);

    if (Number.isNaN(withdrawAmount)) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    if (withdrawAmount <= 0) {
      setErrorMessage("Amount must be greater than zero.");
      return;
    }

    // -----------------------------------------------------
    // SELECTED ACCOUNT VALIDATION
    // -----------------------------------------------------

    if (!selectedAccount) {
      setErrorMessage("Selected account not found.");
      return;
    }

    // -----------------------------------------------------
    // BALANCE VALIDATION
    // -----------------------------------------------------

    const currentBalance = Number(
      selectedAccount.balance || 0
    );

    if (withdrawAmount > currentBalance) {
      setErrorMessage("Insufficient balance.");
      return;
    }

    // -----------------------------------------------------
    // CALL BACKEND
    // -----------------------------------------------------

    try {
      setWithdrawing(true);

      const res = await API.post("/transactions", {
        transaction_type: "WITHDRAW",
        account_id: Number(accountId),
        amount: withdrawAmount
      });

      // ---------------------------------------------------
      // SUCCESS
      // ---------------------------------------------------

      if (res.data?.status === "success") {
        const updatedBalance = Number(
          res.data?.data?.updated_balance ??
          currentBalance - withdrawAmount
        );

        // Update account balance on screen
        setAccounts((previousAccounts) =>
          previousAccounts.map((account) =>
            String(account.account_id) === String(accountId)
              ? {
                  ...account,
                  balance: updatedBalance
                }
              : account
          )
        );

        setAmount("");

        setSuccessMessage(
          `₹ ${withdrawAmount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })} withdrawn successfully.`
        );

        // Go back to dashboard after 1 second
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);

        return;
      }

      // ---------------------------------------------------
      // BACKEND FAILURE
      // ---------------------------------------------------

      setErrorMessage(
        res.data?.message || "Withdrawal failed."
      );
    } catch (error) {
      console.error("Withdrawal error:", error);

      // ---------------------------------------------------
      // SESSION EXPIRED
      // ---------------------------------------------------

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");

        localStorage.clear();
        navigate("/");

        return;
      }

      // ---------------------------------------------------
      // OTHER BACKEND ERROR
      // ---------------------------------------------------

      setErrorMessage(
        error.response?.data?.message ||
        "Unable to process withdrawal."
      );
    } finally {
      setWithdrawing(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="withdraw-page">

      <div className="withdraw-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="withdraw-header">

          <button
            className="withdraw-back-btn"
            onClick={() => navigate("/dashboard")}
            type="button"
          >
            ←
          </button>

          <h1>Withdraw</h1>

        </div>


        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="withdraw-form"
          onSubmit={handleWithdraw}
        >

          {/* =================================================
              SELECT ACCOUNT
          ================================================= */}

          <div className="withdraw-field">

            <label>
              Select Account
            </label>

            {loading ? (

              <p>
                Loading accounts...
              </p>

            ) : accounts.length === 0 ? (

              <p>
                No bank account found.
              </p>

            ) : (

              <select
                value={accountId}
                onChange={handleAccountChange}
                disabled={withdrawing}
              >

                {accounts.map((account) => (

                  <option
                    key={account.account_id}
                    value={account.account_id}
                  >
                    {account.account_number}
                  </option>

                ))}

              </select>

            )}

          </div>


          {/* =================================================
              AVAILABLE BALANCE
          ================================================= */}

          {selectedAccount && (

            <div className="withdraw-balance">

              <span>
                Available Balance
              </span>

              <strong>
                ₹{" "}
                {Number(
                  selectedAccount.balance || 0
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </strong>

            </div>

          )}


          {/* =================================================
              WITHDRAWAL AMOUNT
          ================================================= */}

          <div className="withdraw-field">

            <label>
              Withdrawal Amount
            </label>

            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              disabled={
                loading ||
                withdrawing ||
                accounts.length === 0
              }
            />

          </div>


          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {errorMessage && (

            <div className="withdraw-error">
              {errorMessage}
            </div>

          )}


          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {successMessage && (

            <div className="withdraw-success">
              {successMessage}
            </div>

          )}


          {/* =================================================
              WITHDRAW BUTTON
          ================================================= */}

          <button
            type="submit"
            className="withdraw-submit-btn"
            disabled={
              loading ||
              withdrawing ||
              accounts.length === 0
            }
          >

            {withdrawing
              ? "Processing..."
              : "Withdraw"}

          </button>


          {/* =================================================
              CANCEL BUTTON
          ================================================= */}

          <button
            type="button"
            className="withdraw-cancel-btn"
            onClick={() => navigate("/dashboard")}
            disabled={withdrawing}
          >
            Cancel
          </button>

        </form>

      </div>

    </div>
  );
}

export default Withdraw;