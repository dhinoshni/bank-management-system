import "./accounts.css";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import API from "../services/api";

function Accounts() {

  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);

  const [accountData, setAccountData] = useState({
    accountNumber: "",
    accountType: "Savings",
    bankName: "",
    ifsc: "",
    branch: ""
  });

  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);


  // ==========================================================
  // FETCH LOGGED-IN USER ACCOUNTS
  // ==========================================================

  const fetchAccounts = useCallback(async () => {

    try {

      const res = await API.get("/accounts");

      if (res.data?.status === "success") {

        const accountList = Array.isArray(
          res.data.data
        )
          ? res.data.data
          : [];

        setAccounts(accountList);

      }

    } catch (err) {

      console.log("Fetch accounts error:", err);

      if (err.response?.status === 401) {

        localStorage.clear();

        navigate("/");

        return;

      }

      if (err.response) {

        alert(
          err.response.data?.message ||
          "Unable to fetch accounts"
        );

      } else {

        alert("Server error");

      }

    }

  }, [navigate]);


  // ==========================================================
  // LOAD ACCOUNTS WHEN PAGE OPENS
  // ==========================================================

  useEffect(() => {

    fetchAccounts();

  }, [fetchAccounts]);


  // ==========================================================
  // HANDLE INPUT
  // ==========================================================

  const handleChange = (e) => {

    const { name, value } = e.target;


    // --------------------------------------------------------
    // ACCOUNT NUMBER
    // Only numbers
    // Maximum 10 digits
    // --------------------------------------------------------

    if (name === "accountNumber") {

      const onlyNumbers =
        value.replace(/\D/g, "");

      setAccountData((previous) => ({
        ...previous,
        accountNumber:
          onlyNumbers.slice(0, 10)
      }));

      return;
    }


    // --------------------------------------------------------
    // OTHER FIELDS
    // --------------------------------------------------------

    setAccountData((previous) => ({
      ...previous,
      [name]: value
    }));

  };


  // ==========================================================
  // CREATE ACCOUNT
  // ==========================================================

  const handleSave = async () => {

    // --------------------------------------------------------
    // ACCOUNT NUMBER VALIDATION
    // --------------------------------------------------------

    if (
      !/^\d{10}$/.test(
        accountData.accountNumber
      )
    ) {

      alert(
        "Account number must be exactly 10 digits."
      );

      return;

    }


    // --------------------------------------------------------
    // OTHER FIELD VALIDATION
    // --------------------------------------------------------

    if (
      accountData.bankName.trim() === "" ||
      accountData.ifsc.trim() === "" ||
      accountData.branch.trim() === ""
    ) {

      alert(
        "Please fill all account details"
      );

      return;

    }


    try {

      setLoading(true);


      // ------------------------------------------------------
      // SEND DATA TO BACKEND
      // ------------------------------------------------------

      const res = await API.post(
        "/accounts",
        {
          account_number:
            accountData.accountNumber,

          account_type:
            accountData.accountType,

          bank_name:
            accountData.bankName.trim(),

          IFSC_code:
            accountData.ifsc.trim(),

          branch:
            accountData.branch.trim()
        }
      );


      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      if (
        res.data?.status === "success"
      ) {

        alert(
          `Account created successfully!\nAccount Number: ${res.data.data.account_number}`
        );


        // Clear form

        setAccountData({
          accountNumber: "",
          accountType: "Savings",
          bankName: "",
          ifsc: "",
          branch: ""
        });


        // Hide Create Account button

        setIsEditing(false);


        // Refresh account list

        await fetchAccounts();

      } else {

        alert(
          res.data?.message ||
          "Unable to create account"
        );

      }

    } catch (err) {

      console.log(
        "Create account error:",
        err
      );


      // ------------------------------------------------------
      // BACKEND ERROR
      // ------------------------------------------------------

      if (err.response) {

        alert(
          err.response.data?.message ||
          "Unable to create account"
        );

      } else {

        alert("Server error");

      }

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // CREATE ANOTHER ACCOUNT
  // ==========================================================

  const handleEdit = () => {

    setIsEditing(true);

  };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="accounts-container">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="top-header">

        <button
          className="top-back-btn"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ❮
        </button>


        <h2>
          Account Details
        </h2>

      </div>


      {/* =====================================================
          CREATE ACCOUNT CARD
      ===================================================== */}

      <div className="account-card">

        <h3>
          Create Bank Account
        </h3>


        {/* ===================================================
            ACCOUNT NUMBER
        =================================================== */}

        <div className="form-group">

          <label>
            Account Number
          </label>


          <input
            type="text"
            name="accountNumber"
            placeholder="Enter 10-digit account number"
            value={accountData.accountNumber}
            onChange={handleChange}
            disabled={!isEditing}
            maxLength={10}
            inputMode="numeric"
            autoComplete="off"
          />

        </div>


        {/* ===================================================
            BANK NAME
        =================================================== */}

        <div className="form-group">

          <label>
            Bank Name
          </label>


          <input
            type="text"
            name="bankName"
            placeholder="Enter bank name"
            value={accountData.bankName}
            onChange={handleChange}
            disabled={!isEditing}
          />

        </div>


        {/* ===================================================
            IFSC CODE
        =================================================== */}

        <div className="form-group">

          <label>
            IFSC Code
          </label>


          <input
            type="text"
            name="ifsc"
            placeholder="Enter IFSC code"
            value={accountData.ifsc}
            onChange={handleChange}
            disabled={!isEditing}
          />

        </div>


        {/* ===================================================
            ACCOUNT TYPE
        =================================================== */}

        <div className="form-group">

          <label>
            Account Type
          </label>


          <select
            name="accountType"
            value={accountData.accountType}
            onChange={handleChange}
            disabled={!isEditing}
          >

            <option value="Savings">
              Savings
            </option>


            <option value="Current">
              Current
            </option>

          </select>

        </div>


        {/* ===================================================
            BRANCH
        =================================================== */}

        <div className="form-group">

          <label>
            Branch
          </label>


          <input
            type="text"
            name="branch"
            placeholder="Enter branch"
            value={accountData.branch}
            onChange={handleChange}
            disabled={!isEditing}
          />

        </div>


        {/* ===================================================
            BUTTONS
        =================================================== */}

        <div className="button-group">

          {isEditing && (

            <button
              className="save-btn"
              onClick={handleSave}
              disabled={loading}
            >

              {
                loading
                  ? "Creating..."
                  : "Create Account"
              }

            </button>

          )}


          {!isEditing && (

            <button
              className="edit-btn"
              onClick={handleEdit}
            >
              Create Another Account
            </button>

          )}

        </div>

      </div>


      {/* =====================================================
          EXISTING ACCOUNTS
      ===================================================== */}

      <div className="account-card">

        <h3>
          My Accounts
        </h3>


        {accounts.length === 0 ? (

          <p className="no-data">

            No bank account found.
            Create your first account.

          </p>

        ) : (

          accounts.map((account) => (

            <div
              className="existing-account"
              key={account.account_id}
            >

              <p>

                <strong>
                  Account Number:
                </strong>{" "}

                {account.account_number}

              </p>


              <p>

                <strong>
                  Bank:
                </strong>{" "}

                {account.bank_name}

              </p>


              <p>

                <strong>
                  Account Type:
                </strong>{" "}

                {account.account_type}

              </p>


              <p>

                <strong>
                  IFSC:
                </strong>{" "}

                {account.IFSC_code}

              </p>


              <p>

                <strong>
                  Branch:
                </strong>{" "}

                {account.branch}

              </p>


              <p>

                <strong>
                  Balance:
                </strong>{" "}

                ₹{" "}

                {parseFloat(
                  account.balance || 0
                ).toLocaleString("en-IN")}

              </p>

            </div>

          ))

        )}

      </div>

    </div>

  );

}

export default Accounts;