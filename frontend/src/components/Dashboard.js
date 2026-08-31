import "./dashboard.css";

import {
  useState,
  useEffect,
  useCallback
} from "react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";


function Dashboard() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const navigate = useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [open, setOpen] = useState(false);

  const [showLogout, setShowLogout] =
    useState(false);

  const [accounts, setAccounts] =
    useState([]);

  const [transactions, setTransactions] =
    useState([]);


  // ==========================================================
  // PARSE TRANSACTION DATE
  // ==========================================================

  const parseTransactionDate =
    useCallback((dateValue) => {

      if (!dateValue) {
        return null;
      }

      const value =
        String(dateValue).trim();


      // MYSQL DATETIME
      const mysqlMatch =
        value.match(
          /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/
        );


      if (mysqlMatch) {

        const year =
          Number(mysqlMatch[1]);

        const month =
          Number(mysqlMatch[2]);

        const day =
          Number(mysqlMatch[3]);

        const hours =
          Number(mysqlMatch[4]);

        const minutes =
          Number(mysqlMatch[5]);

        const seconds =
          Number(mysqlMatch[6]);


        return new Date(
          year,
          month - 1,
          day,
          hours,
          minutes,
          seconds
        );
      }


      // FLASK DATE FORMAT
      const flaskMatch =
        value.match(
          /^(?:\w{3},\s*)?(\d{1,2})\s+(\w{3})\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})(?:\s+GMT)?$/i
        );


      if (flaskMatch) {

        const day =
          Number(flaskMatch[1]);


        const monthNames = {

          jan: 0,
          feb: 1,
          mar: 2,
          apr: 3,
          may: 4,
          jun: 5,
          jul: 6,
          aug: 7,
          sep: 8,
          oct: 9,
          nov: 10,
          dec: 11

        };


        const month =
          monthNames[
            flaskMatch[2].toLowerCase()
          ];


        const year =
          Number(flaskMatch[3]);


        const hours =
          Number(flaskMatch[4]);


        const minutes =
          Number(flaskMatch[5]);


        const seconds =
          Number(flaskMatch[6]);


        if (month !== undefined) {

          return new Date(
            year,
            month,
            day,
            hours,
            minutes,
            seconds
          );
        }
      }


      // ISO DATE
      const isoMatch =
        value.match(
          /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/
        );


      if (isoMatch) {

        const year =
          Number(isoMatch[1]);

        const month =
          Number(isoMatch[2]);

        const day =
          Number(isoMatch[3]);

        const hours =
          Number(isoMatch[4]);

        const minutes =
          Number(isoMatch[5]);

        const seconds =
          Number(isoMatch[6]);


        return new Date(
          year,
          month - 1,
          day,
          hours,
          minutes,
          seconds
        );
      }


      // FALLBACK
      const date =
        new Date(value);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return null;

      }


      return date;

    }, []);


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatTransactionDateTime =
    useCallback(
      (dateValue) => {

        const date =
          parseTransactionDate(
            dateValue
          );


        if (!date) {
          return "";
        }


        return date.toLocaleString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          }
        );

      },
      [parseTransactionDate]
    );


  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  useEffect(() => {

    let mounted = true;


    const loadDashboardData =
      async () => {

        try {

          // ==================================================
          // GET ACCOUNTS FIRST
          // ==================================================

          const accountResponse =
            await API.get(
              "/accounts"
            );


          if (!mounted) {
            return;
          }


          if (
            accountResponse.data?.status ===
            "success"
          ) {

            const accountData =
              Array.isArray(
                accountResponse.data.data
              )
                ? accountResponse.data.data
                : [];


            setAccounts(
              accountData
            );

          } else {

            setAccounts([]);

          }


          // ==================================================
          // GET TRANSACTIONS
          // ==================================================

          const transactionResponse =
            await API.get(
              "/transactions"
            );


          if (!mounted) {
            return;
          }


          if (
            transactionResponse.data?.status !==
            "success"
          ) {

            setTransactions([]);

            return;
          }


          const data =
            Array.isArray(
              transactionResponse.data.data
            )
              ? transactionResponse.data.data
              : [];


          // ==================================================
          // REMOVE DUPLICATES
          // ==================================================

          const transactionMap =
            new Map();


          data.forEach(
            (transaction, index) => {

              const transactionId =
                transaction.transaction_id !==
                  undefined &&
                transaction.transaction_id !==
                  null
                  ? String(
                      transaction.transaction_id
                    )
                  : `fallback-${index}`;


              if (
                !transactionMap.has(
                  transactionId
                )
              ) {

                transactionMap.set(
                  transactionId,
                  transaction
                );

              }

            }
          );


          const uniqueTransactions =
            Array.from(
              transactionMap.values()
            );


          // ==================================================
          // NEWEST FIRST
          // ==================================================

          uniqueTransactions.sort(
            (a, b) => {

              const dateA =
                parseTransactionDate(
                  a.created_at
                );


              const dateB =
                parseTransactionDate(
                  b.created_at
                );


              const timeA =
                dateA
                  ? dateA.getTime()
                  : 0;


              const timeB =
                dateB
                  ? dateB.getTime()
                  : 0;


              if (
                timeA !== timeB
              ) {

                return (
                  timeB - timeA
                );

              }


              return (
                Number(
                  b.transaction_id || 0
                ) -
                Number(
                  a.transaction_id || 0
                )
              );

            }
          );


          setTransactions(
            uniqueTransactions
          );


        } catch (err) {

          console.error(
            "Dashboard data error:",
            err
          );


          if (
            err.response?.status === 401
          ) {

            alert(
              "Session expired. Please login again."
            );


            localStorage.clear();


            navigate(
              "/",
              {
                replace: true
              }
            );

          }

        }

      };


    loadDashboardData();


    return () => {

      mounted = false;

    };

  }, [
    navigate,
    parseTransactionDate
  ]);


  // ==========================================================
  // TOTAL BALANCE
  //
  // This is ONLY the combined balance.
  // Individual account balances are shown separately below.
  // ==========================================================

  const totalBalance =
    accounts.reduce(
      (sum, account) => {

        return (
          sum +
          Number(
            account?.balance || 0
          )
        );

      },
      0
    );


  // ==========================================================
  // SELF DEPOSIT
  // ==========================================================

  const isSelfDeposit =
    (transaction) => {

      return (
        transaction.transaction_type ===
          "DEPOSIT" &&
        String(
          transaction.sender_name || ""
        )
          .trim()
          .toLowerCase() ===
          "self"
      );

    };


  // ==========================================================
  // TRANSACTION TITLE
  // ==========================================================

  const getTransactionTitle =
    (transaction) => {

      if (
        isSelfDeposit(
          transaction
        )
      ) {

        return "Money deposited";

      }


      if (
        transaction.transaction_type ===
        "DEPOSIT"
      ) {

        return `Received from ${
          transaction.sender_name ||
          "User"
        }`;

      }


      if (
        transaction.transaction_type ===
        "TRANSFER"
      ) {

        return `Sent to ${
          transaction.receiver_name ||
          "User"
        }`;

      }


      if (
        transaction.transaction_type ===
        "WITHDRAW"
      ) {

        return "Withdrawn";

      }


      return "Transaction";

    };


  // ==========================================================
  // TRANSACTION SUBTITLE
  // ==========================================================

  const getTransactionSubtitle =
    (transaction) => {

      if (
        isSelfDeposit(
          transaction
        )
      ) {

        return "Self";

      }


      return formatTransactionDateTime(
        transaction.created_at
      );

    };


  // ==========================================================
  // CREDIT
  // ==========================================================

  const isCredit =
    (transaction) => {

      return (
        transaction.transaction_type ===
        "DEPOSIT"
      );

    };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {

    localStorage.clear();

    navigate(
      "/",
      {
        replace: true
      }
    );

  };


  // ==========================================================
  // FORMAT ACCOUNT BALANCE
  // ==========================================================

  const formatBalance =
    (balance) => {

      return Number(
        balance || 0
      ).toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }
      );

    };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="dashboard-container">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <div
        className={`sidebar ${
          open
            ? "open"
            : "close"
        }`}
      >

        <div className="sidebar-top">

          <h2>
            🏦 BankApp
          </h2>


          <button
            type="button"
            onClick={() =>
              setOpen(false)
            }
          >
            ✖
          </button>

        </div>


        <ul>

          <li>
            🏠 Dashboard
          </li>


          <li
            onClick={() =>
              navigate(
                "/accounts"
              )
            }
          >
            📁 Accounts
          </li>


          <li
            onClick={() =>
              navigate(
                "/transfer"
              )
            }
          >
            🔄 Transfer
          </li>


          <li
            onClick={() =>
              navigate(
                "/transactions"
              )
            }
          >
            📊 Transactions
          </li>


          <li
            onClick={() =>
              navigate(
                "/profile"
              )
            }
          >
            👤 Profile
          </li>


          <li
            onClick={() =>
              setShowLogout(true)
            }
          >
            🚪 Logout
          </li>

        </ul>

      </div>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="main">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="header">

          <div className="header-left">

            <button
              type="button"
              className="menu-btn"
              onClick={() =>
                setOpen(true)
              }
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


        {/* =================================================
            TOTAL BALANCE
        ================================================= */}

        <div className="balance-card">

          <div>

            <h3>
              Total Balance
            </h3>


            <h1>
              ₹{" "}
              {totalBalance.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                }
              )}
            </h1>

          </div>

        </div>


        {/* =================================================
            INDIVIDUAL ACCOUNT BALANCES
        ================================================= */}

        <div
          style={{
            marginTop: "30px"
          }}
        >

          <h3
            style={{
              fontSize: "30px",
              color: "#123f78",
              marginBottom: "20px"
            }}
          >
            Your Accounts
          </h3>


          {accounts.length === 0 ? (

            <div
              style={{
                background: "#ffffff",
                padding: "25px",
                borderRadius: "18px",
                boxShadow:
                  "0 4px 15px rgba(0,0,0,0.08)"
              }}
            >

              <p
                style={{
                  margin: 0,
                  fontSize: "18px"
                }}
              >
                No bank account found.
                Create your first account.
              </p>

            </div>

          ) : (

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px"
              }}
            >

              {accounts.map(
                (account) => (

                  <div
                    key={
                      account.account_id
                    }
                    style={{
                      background:
                        "#ffffff",
                      borderRadius:
                        "18px",
                      padding:
                        "25px",
                      boxShadow:
                        "0 4px 15px rgba(0,0,0,0.08)",
                      border:
                        "1px solid #e1e8f5"
                    }}
                  >

                    {/* ACCOUNT NUMBER */}

                    <p
                      style={{
                        margin:
                          "0 0 10px 0",
                        color:
                          "#6480a5",
                        fontSize:
                          "16px"
                      }}
                    >
                      Account Number
                    </p>


                    <h3
                      style={{
                        margin:
                          "0 0 20px 0",
                        color:
                          "#123f78",
                        fontSize:
                          "25px",
                        letterSpacing:
                          "1px"
                      }}
                    >
                      {account.account_number}
                    </h3>


                    {/* BANK */}

                    <p
                      style={{
                        margin:
                          "5px 0",
                        fontSize:
                          "16px"
                      }}
                    >
                      <strong>
                        Bank:
                      </strong>{" "}
                      {account.bank_name}
                    </p>


                    {/* ACCOUNT TYPE */}

                    <p
                      style={{
                        margin:
                          "5px 0",
                        fontSize:
                          "16px"
                      }}
                    >
                      <strong>
                        Type:
                      </strong>{" "}
                      {account.account_type}
                    </p>


                    {/* BRANCH */}

                    <p
                      style={{
                        margin:
                          "5px 0",
                        fontSize:
                          "16px"
                      }}
                    >
                      <strong>
                        Branch:
                      </strong>{" "}
                      {account.branch}
                    </p>


                    {/* INDIVIDUAL BALANCE */}

                    <div
                      style={{
                        marginTop:
                          "20px",
                        paddingTop:
                          "18px",
                        borderTop:
                          "1px solid #e1e8f5"
                      }}
                    >

                      <p
                        style={{
                          margin:
                            "0 0 5px 0",
                          color:
                            "#6480a5",
                          fontSize:
                            "15px"
                        }}
                      >
                        Account Balance
                      </p>


                      <h2
                        style={{
                          margin:
                            "0",
                          color:
                            "#087f3f",
                          fontSize:
                            "30px"
                        }}
                      >
                        ₹{" "}
                        {formatBalance(
                          account.balance
                        )}
                      </h2>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div
          className="quick-actions"
          style={{
            marginTop: "35px"
          }}
        >

          <h3>
            Quick Actions
          </h3>


          <div className="actions">


            {/* DEPOSIT */}

            <div
              className="action-card"
              onClick={() =>
                navigate(
                  "/deposit"
                )
              }
            >

              <div className="action-icon">
                💰
              </div>


              <p>
                Deposit
              </p>

            </div>


            {/* WITHDRAW */}

            <div
              className="action-card"
              onClick={() =>
                navigate(
                  "/withdraw"
                )
              }
            >

              <div className="action-icon">
                🏧
              </div>


              <p>
                Withdraw
              </p>

            </div>


            {/* TRANSFER */}

            <div
              className="action-card"
              onClick={() =>
                navigate(
                  "/transfer"
                )
              }
            >

              <div className="action-icon">
                🔄
              </div>


              <p>
                Transfer
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            RECENT TRANSACTIONS
        ================================================= */}

        <div className="transactions">


          <div className="transactions-header">

            <h3>
              Recent Transactions
            </h3>


            <span
              className="view-all"
              onClick={() =>
                navigate(
                  "/transactions"
                )
              }
            >
              View All →
            </span>

          </div>


          {transactions.length === 0 ? (

            <p className="no-data">
              No transactions found
            </p>

          ) : (

            transactions
              .slice(0, 5)
              .map(
                (
                  transaction,
                  index
                ) => {

                  const credit =
                    isCredit(
                      transaction
                    );


                  return (

                    <div
                      className="transaction-item"
                      key={
                        transaction.transaction_id ||
                        index
                      }
                    >


                      {/* LEFT */}

                      <div className="transaction-left">


                        <div
                          className={
                            credit
                              ? "transaction-icon deposit-bg"
                              : "transaction-icon withdraw-bg"
                          }
                        >

                          {credit
                            ? "⬇"
                            : "⬆"}

                        </div>


                        <div>

                          <p className="transaction-title">

                            {getTransactionTitle(
                              transaction
                            )}

                          </p>


                          <small>

                            {getTransactionSubtitle(
                              transaction
                            )}

                          </small>


                          {/* SHOW ACCOUNT NUMBER */}

                          <small
                            style={{
                              display:
                                "block",
                              marginTop:
                                "4px",
                              color:
                                "#7186a5"
                            }}
                          >

                            Account:{" "}
                            {
                              transaction.account_number
                            }

                          </small>

                        </div>

                      </div>


                      {/* RIGHT */}

                      <div>

                        <p
                          className={
                            credit
                              ? "credit"
                              : "debit"
                          }
                        >

                          {credit
                            ? "+ "
                            : "- "}

                          ₹{" "}

                          {Number(
                            transaction.amount ||
                              0
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits:
                                2,
                              maximumFractionDigits:
                                2
                            }
                          )}

                        </p>

                      </div>

                    </div>

                  );

                }
              )

          )}

        </div>

      </div>


      {/* =====================================================
          LOGOUT POPUP
      ===================================================== */}

      {showLogout && (

        <div className="logout-overlay">

          <div className="logout-box">


            <div className="logout-icon">
              ↩
            </div>


            <h2>
              Logout
            </h2>


            <p>
              Are you sure you want to logout?
            </p>


            <button
              type="button"
              className="yes-btn"
              onClick={
                handleLogout
              }
            >
              Yes, Logout
            </button>


            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                setShowLogout(false)
              }
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>

  );

}


export default Dashboard;