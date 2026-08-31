import "./transfer.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Transfer() {
  const navigate = useNavigate();

  // Logged-in user
  const user = JSON.parse(localStorage.getItem("user"));

  const [accounts, setAccounts] = useState([]);

  // =====================================================
  // SENDER ACCOUNT
  // =====================================================

  const [fromAccountInput, setFromAccountInput] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [fromAccountHolder, setFromAccountHolder] = useState("");

  // =====================================================
  // RECEIVER ACCOUNT
  // =====================================================

  const [toAccountInput, setToAccountInput] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [toAccountHolder, setToAccountHolder] = useState("");
  const [receiverLoading, setReceiverLoading] = useState(false);

  // =====================================================
  // TRANSFER DETAILS
  // =====================================================

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingTransfer, setLoadingTransfer] = useState(false);

  // =====================================================
  // FETCH ACCOUNTS
  // =====================================================

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoadingAccounts(true);

        const res = await API.get("/accounts");

        console.log("Accounts:", res.data);

        if (res.data.status === "success") {
          setAccounts(res.data.data);

          // Logged-in user's name
          setFromAccountHolder(user?.name || "");
        }
      } catch (err) {
        console.error("Account fetch error:", err);

        if (err.response?.status === 401) {
          alert("Session expired. Please login again.");

          localStorage.clear();

          navigate("/");
        } else {
          alert(
            err.response?.data?.message ||
            "Unable to load accounts"
          );
        }
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, [navigate, user?.name]);


  // =====================================================
  // GET ACCOUNT HOLDER NAME
  // =====================================================

  const getAccountHolder = (account) => {
    return (
      account.user_name ||
      account.name ||
      account.account_holder_name ||
      account.username ||
      account.account_holder ||
      user?.name ||
      ""
    );
  };


  // =====================================================
  // FROM ACCOUNT
  // =====================================================

  const handleFromAccountChange = (e) => {
    const value = e.target.value.trim();

    setFromAccountInput(value);

    const selectedAccount = accounts.find(
      (account) =>
        String(account.account_number) === value
    );

    if (selectedAccount) {
      setFromAccountId(
        String(selectedAccount.account_id)
      );

      setFromAccountHolder(
        getAccountHolder(selectedAccount)
      );
    } else {
      setFromAccountId("");
      setFromAccountHolder("");
    }
  };


  // =====================================================
  // TO ACCOUNT
  // =====================================================

  const handleToAccountChange = async (e) => {
    const value = e.target.value.trim();

    setToAccountInput(value);
    setToAccountId("");
    setToAccountHolder("");

    if (!value) {
      return;
    }

    // Check existing/local accounts first
    const localAccount = accounts.find(
      (account) =>
        String(account.account_number) === value
    );

    if (localAccount) {
      setToAccountId(
        String(localAccount.account_id)
      );

      setToAccountHolder(
        getAccountHolder(localAccount)
      );

      return;
    }

    // Search backend for receiver account
    if (value.length === 10) {
      try {
        setReceiverLoading(true);

        const res = await API.get(
          `/accounts/lookup/${encodeURIComponent(value)}`
        );

        console.log(
          "Receiver lookup:",
          res.data
        );

        if (res.data.status === "success") {
          setToAccountId(
            String(res.data.data.account_id)
          );

          setToAccountHolder(
            res.data.data.account_holder ||
            res.data.data.user_name ||
            res.data.data.name ||
            ""
          );
        }
      } catch (err) {
        console.error(
          "Receiver lookup error:",
          err
        );

        if (err.response?.status === 404) {
          setToAccountId("");
          setToAccountHolder("");
        }

        if (err.response?.status === 401) {
          alert(
            "Session expired. Please login again."
          );

          localStorage.clear();

          navigate("/");
        }
      } finally {
        setReceiverLoading(false);
      }
    }
  };


  // =====================================================
  // TRANSFER MONEY
  // =====================================================

  const handleTransfer = async () => {

    // Validate sender
    if (!fromAccountId) {
      alert(
        "Please select or enter a valid sender account number."
      );
      return;
    }


    // Validate receiver
    if (!toAccountId) {
      alert(
        "Please enter a valid receiver account number."
      );
      return;
    }


    // Prevent same account transfer
    if (
      String(fromAccountId) ===
      String(toAccountId)
    ) {
      alert(
        "Sender and receiver accounts cannot be the same."
      );
      return;
    }


    // Validate amount
    const transferAmount = parseFloat(amount);

    if (
      !amount ||
      isNaN(transferAmount) ||
      transferAmount <= 0
    ) {
      alert("Please enter a valid amount.");
      return;
    }


    try {
      setLoadingTransfer(true);


      const res = await API.post("/transactions", {

        transaction_type: "TRANSFER",

        from_account_id:
          Number(fromAccountId),

        to_account_id:
          Number(toAccountId),

        amount:
          transferAmount,

        description:
          description.trim()

      });


      console.log(
        "Transfer response:",
        res.data
      );


      // =================================================
      // SUCCESS
      // =================================================

      if (res.data.status === "success") {

        /*
          IMPORTANT:

          Do NOT clear the fields here.

          We need these values for the
          Transfer Success page.
        */

        navigate("/transfer-success", {

          state: {

            fromAccount:
              fromAccountInput,

            fromName:
              fromAccountHolder ||
              user?.name ||
              "Account holder",

            toAccount:
              toAccountInput,

            toName:
              toAccountHolder ||
              "Account holder",

            amount:
              transferAmount

          }

        });

      } else {

        alert(
          res.data.message ||
          "Transfer failed."
        );

      }

    } catch (err) {

      console.error(
        "Transfer error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        alert(
          "Session expired. Please login again."
        );

        localStorage.clear();

        navigate("/");

      } else {

        alert(
          err.response?.data?.message ||
          "Transfer failed."
        );

      }

    } finally {

      setLoadingTransfer(false);

    }
  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="transfer-page">

      <div className="transfer-card">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="transfer-header">

          <button
            type="button"
            className="transfer-back"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ←
          </button>

          <div>

            <h1>
              Send Money
            </h1>

            <p>
              Transfer funds securely to
              another bank account
            </p>

          </div>

        </div>


        {/* =================================================
            ACCOUNT LOADING
        ================================================= */}

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

          <>


            {/* =================================================
                FROM ACCOUNT
            ================================================= */}

            <div className="transfer-form-group">

              <label>
                From Account
              </label>

              <input
                className="account-input"
                type="text"
                inputMode="numeric"
                list="from-account-list"
                placeholder="Select or enter account number"
                value={fromAccountInput}
                onChange={
                  handleFromAccountChange
                }
                autoComplete="off"
                maxLength="10"
              />


              <datalist id="from-account-list">

                {accounts.map(
                  (account) => (

                    <option
                      key={
                        account.account_id
                      }
                      value={
                        account.account_number
                      }
                    />

                  )
                )}

              </datalist>


              {/* SENDER NAME */}

              {fromAccountId && (

                <div className="account-holder">

                  <span>
                    Account Holder
                  </span>

                  <strong>
                    {fromAccountHolder ||
                      user?.name ||
                      "Account holder"}
                  </strong>

                </div>

              )}

            </div>


            {/* =================================================
                TO ACCOUNT
            ================================================= */}

            <div className="transfer-form-group">

              <label>
                To Account
              </label>

              <input
                className="account-input"
                type="text"
                inputMode="numeric"
                list="to-account-list"
                placeholder="Enter receiver account number"
                value={toAccountInput}
                onChange={
                  handleToAccountChange
                }
                autoComplete="off"
                maxLength="10"
              />


              <datalist id="to-account-list">

                {accounts.map(
                  (account) => (

                    <option
                      key={
                        account.account_id
                      }
                      value={
                        account.account_number
                      }
                    />

                  )
                )}

              </datalist>


              {/* RECEIVER SEARCH */}

              {receiverLoading && (

                <div className="lookup-status">
                  Finding account...
                </div>

              )}


              {/* RECEIVER NAME */}

              {toAccountId &&
                !receiverLoading && (

                  <div className="account-holder">

                    <span>
                      Receiver Name
                    </span>

                    <strong>
                      {toAccountHolder ||
                        "Account holder"}
                    </strong>

                  </div>

                )}

            </div>


            {/* =================================================
                AMOUNT
            ================================================= */}

            <div className="transfer-form-group">

              <label>
                Enter Amount
              </label>

              <div className="amount-input">

                <span>
                  ₹
                </span>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="transfer-form-group">

              <label>

                Description

                <span className="optional">
                  Optional
                </span>

              </label>

              <input
                className="description-input"
                type="text"
                placeholder="Add a note"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />

            </div>


            {/* =================================================
                SEND MONEY
            ================================================= */}

            <button
              type="button"
              className="transfer-submit"
              onClick={handleTransfer}
              disabled={
                loadingTransfer ||
                loadingAccounts ||
                receiverLoading
              }
            >

              {loadingTransfer
                ? "Processing..."
                : "Send Money"}

            </button>

          </>

        )}

      </div>

    </div>

  );
}

export default Transfer;