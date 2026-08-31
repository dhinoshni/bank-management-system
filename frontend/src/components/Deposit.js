import "./deposit.css";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Deposit() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");

  const [loadingAccounts, setLoadingAccounts] =
    useState(true);

  const [loadingDeposit, setLoadingDeposit] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // =====================================================
  // FETCH USER ACCOUNTS
  // =====================================================

  const fetchAccounts = useCallback(async () => {
    try {
      setLoadingAccounts(true);
      setErrorMessage("");

      const res = await API.get("/accounts");

      console.log(
        "Accounts API response:",
        res.data
      );

      if (res.data?.status === "success") {
        const userAccounts = Array.isArray(
          res.data.data
        )
          ? res.data.data
          : [];

        console.log(
          "User accounts:",
          userAccounts
        );

        setAccounts(userAccounts);

        // Select first account automatically
        if (userAccounts.length > 0) {
          setAccountId(
            String(
              userAccounts[0].account_id
            )
          );
        } else {
          setAccountId("");
        }
      } else {
        setAccounts([]);
        setAccountId("");

        setErrorMessage(
          res.data?.message ||
            "Unable to load accounts."
        );
      }
    } catch (err) {
      console.error(
        "Account fetch error:",
        err
      );

      // Session expired
      if (err.response?.status === 401) {
        alert(
          "Session expired. Please login again."
        );

        localStorage.clear();
        navigate("/");

        return;
      }

      setErrorMessage(
        err.response?.data?.message ||
          "Unable to load accounts."
      );
    } finally {
      setLoadingAccounts(false);
    }
  }, [navigate]);

  // =====================================================
  // LOAD ACCOUNTS WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // =====================================================
  // ACCOUNT SELECTION
  // =====================================================

  const handleAccountChange = (e) => {
    const value = e.target.value;

    console.log(
      "Selected account ID:",
      value
    );

    setAccountId(value);

    setSuccessMessage("");
    setErrorMessage("");
  };

  // =====================================================
  // AMOUNT CHANGE
  // =====================================================

  const handleAmountChange = (e) => {
    setAmount(e.target.value);

    setSuccessMessage("");
    setErrorMessage("");
  };

  // =====================================================
  // DEPOSIT MONEY
  // =====================================================

  const handleDeposit = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    // ---------------------------------------------------
    // ACCOUNT VALIDATION
    // ---------------------------------------------------

    if (!accountId) {
      setErrorMessage(
        "Please select a valid account."
      );

      return;
    }

    // ---------------------------------------------------
    // AMOUNT VALIDATION
    // ---------------------------------------------------

    if (amount.trim() === "") {
      setErrorMessage(
        "Please enter a valid amount."
      );

      return;
    }

    const depositAmount = Number(amount);

    if (
      Number.isNaN(depositAmount) ||
      depositAmount <= 0
    ) {
      setErrorMessage(
        "Amount must be greater than zero."
      );

      return;
    }

    // ---------------------------------------------------
    // PROCESS DEPOSIT
    // ---------------------------------------------------

    try {
      setLoadingDeposit(true);

      console.log(
        "Depositing:",
        {
          transaction_type: "DEPOSIT",
          account_id: Number(accountId),
          amount: depositAmount
        }
      );

      const res = await API.post(
        "/transactions",
        {
          transaction_type: "DEPOSIT",
          account_id: Number(accountId),
          amount: depositAmount
        }
      );

      console.log(
        "Deposit response:",
        res.data
      );

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      if (res.data?.status === "success") {
        setSuccessMessage(
          `₹ ${depositAmount.toLocaleString(
            "en-IN",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }
          )} deposited successfully.`
        );

        // Clear amount
        setAmount("");

        // ------------------------------------------------
        // Update selected account balance locally
        // ------------------------------------------------

        const updatedBalance =
          res.data?.data?.updated_balance;

        if (
          updatedBalance !== undefined
        ) {
          setAccounts(
            (previousAccounts) =>
              previousAccounts.map(
                (account) =>
                  String(
                    account.account_id
                  ) === String(accountId)
                    ? {
                        ...account,
                        balance:
                          updatedBalance
                      }
                    : account
              )
          );
        }

        // Refresh account list
        await fetchAccounts();
      } else {
        setErrorMessage(
          res.data?.message ||
            "Deposit failed."
        );
      }
    } catch (err) {
      console.error(
        "Deposit error:",
        err
      );

      // -------------------------------------------------
      // SESSION EXPIRED
      // -------------------------------------------------

      if (err.response?.status === 401) {
        alert(
          "Session expired. Please login again."
        );

        localStorage.clear();
        navigate("/");

        return;
      }

      // -------------------------------------------------
      // BACKEND ERROR
      // -------------------------------------------------

      setErrorMessage(
        err.response?.data?.message ||
          "Unable to process deposit."
      );
    } finally {
      setLoadingDeposit(false);
    }
  };

  // =====================================================
  // PAGE UI
  // =====================================================

  return (
    <div className="deposit-page">

      <div className="deposit-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="deposit-header">

          <button
            className="deposit-back"
            onClick={() =>
              navigate("/dashboard")
            }
            type="button"
          >
            ←
          </button>

          <div>

            <h1>
              Deposit Money
            </h1>

            <p>
              Add money to your bank account
            </p>

          </div>

        </div>

        {/* =================================================
            SELECT ACCOUNT
        ================================================= */}

        <div className="deposit-form-group">

          <label>
            Select Account
          </label>

          {loadingAccounts ? (

            <div className="loading-text">
              Loading accounts...
            </div>

          ) : accounts.length === 0 ? (

            <div className="empty-account">

              <p>
                No bank account found.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/accounts")
                }
              >
                Create Account
              </button>

            </div>

          ) : (

            <select
              className="account-input"
              value={accountId}
              onChange={handleAccountChange}
              disabled={loadingDeposit}
            >

              <option value="">
                Select an account
              </option>

              {accounts.map(
                (account) => (

                  <option
                    key={account.account_id}
                    value={account.account_id}
                  >
                    {account.account_number}
                  </option>

                )
              )}

            </select>

          )}

        </div>

        {/* =================================================
            ENTER AMOUNT
        ================================================= */}

        <div className="deposit-form-group">

          <label>
            Enter Amount
          </label>

          <div className="amount-input">

            <span>
              ₹
            </span>

            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={handleAmountChange}
              disabled={
                loadingAccounts ||
                loadingDeposit ||
                accounts.length === 0
              }
            />

          </div>

        </div>

        {/* =================================================
            DEPOSIT BUTTON
        ================================================= */}

        <button
          className="deposit-submit"
          onClick={handleDeposit}
          disabled={
            loadingDeposit ||
            loadingAccounts ||
            accounts.length === 0 ||
            !accountId
          }
        >

          {loadingDeposit
            ? "Processing..."
            : "Deposit Money"}

        </button>

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {errorMessage && (

          <div className="error-message">
            {errorMessage}
          </div>

        )}

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {successMessage && (

          <div className="success-message">
            {successMessage}
          </div>

        )}

        {/* =================================================
            SECURITY NOTE
        ================================================= */}

        <p className="secure-text">
          Your transaction is securely processed
        </p>

      </div>

    </div>
  );
}

export default Deposit;