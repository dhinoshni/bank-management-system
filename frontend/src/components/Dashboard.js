import "./dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {

  const user = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const [showLogout, setShowLogout] = useState(false);

  const [accounts, setAccounts] = useState([]);

  const [transactions, setTransactions] = useState([]);

  // FETCH ACCOUNTS
  useEffect(() => {

    axios
      .get("http://127.0.0.1:5000/accounts")

      .then((res) => {

        if (res.data.status === "success") {

          setAccounts(res.data.data);

        }

      })

      .catch((err) => console.log(err));

  }, []);

  // FETCH TRANSACTIONS
  useEffect(() => {

    if (accounts.length > 0) {

      const accountId = accounts[0].account_id;

      axios
        .get(`http://127.0.0.1:5000/transactions/${accountId}`)

        .then((res) => {

          if (res.data.status === "success") {

            // REMOVE DUPLICATES
            const uniqueTransactions =
              res.data.data.filter(
                (value, index, self) =>

                  index ===
                  self.findIndex(
                    (t) =>
                      t.transaction_id ===
                      value.transaction_id
                  )
              );

            setTransactions(uniqueTransactions);

          }

        })

        .catch((err) => console.log(err));
    }

  }, [accounts]);

  // TOTAL BALANCE
  const totalBalance = accounts.reduce(

    (sum, acc) =>

      sum + parseFloat(acc.balance || 0),

    0
  );

  return (

    <div className="dashboard-container">

      {/* SIDEBAR */}
      <div className={`sidebar ${open ? "open" : "close"}`}>

        <div className="sidebar-top">

          <h2>🏦 BankApp</h2>

          <button onClick={() => setOpen(false)}>
            ✖
          </button>

        </div>

        <ul>

          <li>
            🏠 Dashboard
          </li>

          <li onClick={() => navigate("/accounts")}>
            📁 Accounts
          </li>

          <li onClick={() => navigate("/transfer")}>
            🔄 Transfer
          </li>

          <li onClick={() => navigate("/transactions")}>
            📊 Transactions
          </li>

          <li>
            👤 Profile
          </li>

          <li onClick={() => setShowLogout(true)}>
            🚪 Logout
          </li>

        </ul>

      </div>

      {/* MAIN */}
      <div className="main">

        {/* HEADER */}
        <div className="header">

          <div className="header-left">

            <button
              className="menu-btn"
              onClick={() => setOpen(true)}
            >
              ☰
            </button>

            <h2>
              Welcome, {user?.name} 👋
            </h2>

          </div>

          <div className="header-right">
            👤
          </div>

        </div>

        {/* BALANCE CARD */}
        <div className="balance-card">

          <div>

            <h3>Total Balance</h3>

            <h1>
              ₹ {totalBalance.toLocaleString()}
            </h1>

          </div>

        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-actions">

          <h3>Quick Actions</h3>

          <div className="actions">

            {/* DEPOSIT */}
            <div
              className="action-card"
              onClick={() => navigate("/deposit")}
            >

              <div className="action-icon">
                💰
              </div>

              <p>Deposit</p>

            </div>

            {/* WITHDRAW */}
            <div
              className="action-card"
              onClick={() => navigate("/withdraw")}
            >

              <div className="action-icon">
                🏧
              </div>

              <p>Withdraw</p>

            </div>

            {/* TRANSFER */}
            <div
              className="action-card"
              onClick={() => navigate("/transfer")}
            >

              <div className="action-icon">
                🔄
              </div>

              <p>Transfer</p>

            </div>

          </div>

        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="transactions">

          <div className="transactions-header">

            <h3>
              Recent Transactions
            </h3>

            <span
              className="view-all"
              onClick={() => navigate("/transactions")}
            >
              View All →
            </span>

          </div>

          {
            transactions.length === 0 ? (

              <p className="no-data">
                No transactions found
              </p>

            ) : (

              transactions
                .slice(0, 5)

                .map((t, index) => (

                  <div
                    className="transaction-item"
                    key={index}
                  >

                    {/* LEFT */}
                    <div className="transaction-left">

                      <div
                        className={
                          t.transaction_type === "DEPOSIT"
                            ? "transaction-icon deposit-bg"
                            : "transaction-icon withdraw-bg"
                        }
                      >

                        {
                          t.transaction_type === "DEPOSIT"
                            ? "⬇"
                            : "⬆"
                        }

                      </div>

                      <div>

                        <p className="transaction-title">

                          {
                            t.transaction_type === "DEPOSIT"

                              ? `Received from ${t.sender_name || "User"}`

                              : `Sent to ${t.receiver_name || "User"}`
                          }

                        </p>

                        <small>

                          {
                            new Date(
                              t.created_at
                            ).toLocaleString()
                          }

                        </small>

                      </div>

                    </div>

                    {/* RIGHT */}
                    <div>

                      <p
                        className={
                          t.transaction_type === "DEPOSIT"
                            ? "credit"
                            : "debit"
                        }
                      >

                        {
                          t.transaction_type === "DEPOSIT"
                            ? "+ "
                            : "- "
                        }

                        ₹ {t.amount}

                      </p>

                    </div>

                  </div>

                ))
            )
          }

        </div>

      </div>

      {/* LOGOUT POPUP */}
      {
        showLogout && (

          <div className="logout-overlay">

            <div className="logout-box">

              <div className="logout-icon">
                ↩
              </div>

              <h2>Logout</h2>

              <p>
                Are you sure you want to logout?
              </p>

              <button
                className="yes-btn"
                onClick={() => {

                  localStorage.clear();

                  navigate("/", {
                    replace: true
                  });

                }}
              >
                Yes, Logout
              </button>

              <button
                className="cancel-btn"
                onClick={() => setShowLogout(false)}
              >
                Cancel
              </button>

            </div>

          </div>

        )
      }

    </div>
  );
}

export default Dashboard;