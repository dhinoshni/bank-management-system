import "./transactions.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function Transactions() {
  const navigate = useNavigate();

  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // =====================================================
  // DATE OBJECT
  // =====================================================

  const getDateObject = (dateValue) => {
    if (!dateValue) {
      return null;
    }

    // Flask datetime:
    // Sat, 29 Aug 2026 22:48:23 GMT

    if (
      typeof dateValue === "string" &&
      dateValue.includes("GMT")
    ) {
      const match = dateValue.match(
        /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/
      );

      if (match) {
        const [, day, month, year, hour, minute, second] =
          match;

        const months = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };

        const localDate = new Date(
          Number(year),
          months[month],
          Number(day),
          Number(hour),
          Number(minute),
          Number(second)
        );

        if (!Number.isNaN(localDate.getTime())) {
          return localDate;
        }
      }
    }

    // MySQL:
    // 2026-08-29 22:48:23

    if (
      typeof dateValue === "string" &&
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(
        dateValue
      )
    ) {
      const localDate = new Date(
        dateValue.replace(" ", "T")
      );

      if (!Number.isNaN(localDate.getTime())) {
        return localDate;
      }
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  // =====================================================
  // FETCH TRANSACTIONS
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await API.get("/transactions");

        console.log(
          "Logged-in user transactions:",
          response.data
        );

        if (!mounted) {
          return;
        }

        if (response.data?.status !== "success") {
          setAllTransactions([]);
          setFilteredTransactions([]);

          setErrorMessage(
            response.data?.message ||
              "Unable to load transactions."
          );

          return;
        }

        const transactions = Array.isArray(
          response.data.data
        )
          ? response.data.data
          : [];

        // Remove duplicate transaction IDs
        const uniqueTransactions = Array.from(
          new Map(
            transactions.map((transaction) => [
              transaction.transaction_id,
              transaction,
            ])
          ).values()
        );

        // Latest transaction first
        uniqueTransactions.sort((a, b) => {
          const dateA = getDateObject(a.created_at);
          const dateB = getDateObject(b.created_at);

          if (!dateA || !dateB) {
            return 0;
          }

          return dateB.getTime() - dateA.getTime();
        });

        setAllTransactions(uniqueTransactions);
        setFilteredTransactions(uniqueTransactions);
        setVisibleCount(8);

      } catch (error) {
        console.error(
          "Transaction fetch error:",
          error
        );

        if (!mounted) {
          return;
        }

        if (error.response?.status === 401) {
          alert(
            "Session expired. Please login again."
          );

          localStorage.clear();
          navigate("/");

          return;
        }

        setErrorMessage(
          error.response?.data?.message ||
            "Unable to load transaction history."
        );

        setAllTransactions([]);
        setFilteredTransactions([]);

      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTransactions();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (dateValue) => {
    const date = getDateObject(dateValue);

    if (!date) {
      return "";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (dateValue) => {
    const date = getDateObject(dateValue);

    if (!date) {
      return "";
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // LOCAL DATE
  // =====================================================

  const getLocalDate = (dateValue) => {
    const date = getDateObject(dateValue);

    if (!date) {
      return "";
    }

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // CHECK SELF DEPOSIT
  // =====================================================

  const isSelfDeposit = (transaction) => {
    return (
      transaction.transaction_type === "DEPOSIT" &&
      transaction.sender_name === "Self"
    );
  };

  // =====================================================
  // TRANSACTION LABEL
  // =====================================================

  const getTransactionLabel = (transaction) => {

    // -----------------------------------------------
    // SELF DEPOSIT
    // -----------------------------------------------

    if (isSelfDeposit(transaction)) {
      return "Money deposited";
    }

    // -----------------------------------------------
    // RECEIVED MONEY FROM ANOTHER USER
    // -----------------------------------------------

    if (
      transaction.transaction_type === "DEPOSIT"
    ) {
      return "Received money from";
    }

    // -----------------------------------------------
    // TRANSFER SENT
    // -----------------------------------------------

    if (
      transaction.transaction_type === "TRANSFER"
    ) {
      return "Money transferred to";
    }

    // -----------------------------------------------
    // WITHDRAW
    // -----------------------------------------------

    if (
      transaction.transaction_type === "WITHDRAW"
    ) {
      return "Money withdrawn";
    }

    return "Transaction";
  };

  // =====================================================
  // TRANSACTION PERSON / NAME
  // =====================================================

  const getTransactionName = (transaction) => {

    // -----------------------------------------------
    // SELF DEPOSIT
    // -----------------------------------------------

    if (isSelfDeposit(transaction)) {
      return "Self";
    }

    // -----------------------------------------------
    // RECEIVED MONEY
    // -----------------------------------------------

    if (
      transaction.transaction_type === "DEPOSIT"
    ) {
      if (
        transaction.sender_name &&
        transaction.sender_name !== "Self"
      ) {
        return transaction.sender_name;
      }

      return (
        transaction.receiver_name ||
        "Bank Account"
      );
    }

    // -----------------------------------------------
    // MONEY SENT
    // -----------------------------------------------

    if (
      transaction.transaction_type === "TRANSFER"
    ) {
      return (
        transaction.receiver_name ||
        "Bank Account"
      );
    }

    // -----------------------------------------------
    // WITHDRAWAL
    // -----------------------------------------------

    if (
      transaction.transaction_type === "WITHDRAW"
    ) {
      return "ATM Withdrawal";
    }

    return (
      transaction.sender_name ||
      transaction.receiver_name ||
      "Bank Account"
    );
  };

  // =====================================================
  // CREDIT / DEBIT
  // =====================================================

  const isCredit = (transaction) => {
    return (
      transaction.transaction_type === "DEPOSIT"
    );
  };

  // =====================================================
  // TRANSACTION CSS CLASS
  // =====================================================

  const getTransactionClass = (transaction) => {

    if (
      transaction.transaction_type === "WITHDRAW"
    ) {
      return "withdraw";
    }

    if (
      transaction.transaction_type === "DEPOSIT"
    ) {
      return "credit";
    }

    return "debit";
  };

  // =====================================================
  // ACCOUNT TYPE
  // =====================================================

  const getAccountType = (transaction) => {

    if (
      transaction.transaction_type === "WITHDRAW"
    ) {
      return "ATM";
    }

    return "Bank Account";
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filterTransactions = (
    selectedType,
    selectedDate
  ) => {

    let result = [
      ...allTransactions
    ];

    // TYPE
    if (selectedType !== "ALL") {
      result = result.filter(
        (transaction) =>
          transaction.transaction_type ===
          selectedType
      );
    }

    // DATE
    if (selectedDate) {
      result = result.filter(
        (transaction) =>
          getLocalDate(
            transaction.created_at
          ) === selectedDate
      );
    }

    return result;
  };

  // =====================================================
  // APPLY FILTER
  // =====================================================

  const applyFilter = () => {

    const result = filterTransactions(
      typeFilter,
      dateFilter
    );

    setFilteredTransactions(result);
    setVisibleCount(8);
  };

  // =====================================================
  // TYPE FILTER
  // =====================================================

  const handleTypeFilter = (type) => {

    setTypeFilter(type);

    const result = filterTransactions(
      type,
      dateFilter
    );

    setFilteredTransactions(result);
    setVisibleCount(8);
  };

  // =====================================================
  // DATE CHANGE
  // =====================================================

  const handleDateChange = (event) => {
    setDateFilter(event.target.value);
  };

  // =====================================================
  // CLEAR FILTER
  // =====================================================

  const clearFilters = () => {

    setTypeFilter("ALL");
    setDateFilter("");

    setFilteredTransactions(
      allTransactions
    );

    setVisibleCount(8);
  };

  // =====================================================
  // LOAD MORE
  // =====================================================

  const loadMore = () => {

    setVisibleCount(
      (previousCount) =>
        previousCount + 8
    );
  };

  // =====================================================
  // DOWNLOAD STATEMENT
  // =====================================================

  const downloadStatement = () => {

    if (
      filteredTransactions.length === 0
    ) {
      alert(
        "There are no transactions to download."
      );

      return;
    }

    const headers = [
      "Description",
      "Name",
      "Date & Time",
      "Type",
      "Amount",
      "Account",
    ];

    const rows =
      filteredTransactions.map(
        (transaction) => {

          const amount = Number(
            transaction.amount || 0
          );

          const date = getDateObject(
            transaction.created_at
          );

          return [
            getTransactionLabel(
              transaction
            ),

            getTransactionName(
              transaction
            ),

            date
              ? `${formatDate(
                  transaction.created_at
                )} ${formatTime(
                  transaction.created_at
                )}`
              : "",

            transaction.transaction_type,

            `${
              isCredit(transaction)
                ? "+"
                : "-"
            } ₹${amount.toFixed(2)}`,

            getAccountType(
              transaction
            ),
          ];
        }
      );

    const csvRows = [
      headers,
      ...rows,
    ].map(
      (row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
    );

    const csvContent =
      "\uFEFF" +
      csvRows.join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "transaction-statement.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // VISIBLE TRANSACTIONS
  // =====================================================

  const visibleTransactions =
    filteredTransactions.slice(
      0,
      visibleCount
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="transactions-page">

      {/* HEADER */}

      <header className="transactions-header">

        <button
          type="button"
          className="transactions-back-btn"
          onClick={() =>
            navigate("/dashboard")
          }
          aria-label="Back to dashboard"
          title="Back to dashboard"
        >
          ←
        </button>

        <h1>
          Transaction History
        </h1>

        <button
          type="button"
          className="header-download-btn"
          onClick={downloadStatement}
          aria-label="Download statement"
          title="Download statement"
        >
          ↓
        </button>

      </header>

      {/* MAIN */}

      <main className="transactions-container">

        {/* SUMMARY */}

        <section className="transaction-summary">

          <div className="summary-content">

            <span className="summary-label">
              All Transactions
            </span>

            <strong className="summary-count">
              {filteredTransactions.length}
            </strong>

            <span className="summary-text">
              {filteredTransactions.length === 1
                ? "Transaction found"
                : "Transactions found"}
            </span>

          </div>

          <button
            type="button"
            className="summary-download"
            onClick={downloadStatement}
          >

            <span className="download-icon">
              ↓
            </span>

            Download Statement

          </button>

        </section>

        {/* FILTERS */}

        <section className="transaction-filters">

          <div className="filter-tabs">

            <button
              type="button"
              className={
                typeFilter === "ALL"
                  ? "filter-tab active"
                  : "filter-tab"
              }
              onClick={() =>
                handleTypeFilter("ALL")
              }
            >
              All
            </button>

            <button
              type="button"
              className={
                typeFilter === "DEPOSIT"
                  ? "filter-tab active"
                  : "filter-tab"
              }
              onClick={() =>
                handleTypeFilter("DEPOSIT")
              }
            >
              Deposits
            </button>

            <button
              type="button"
              className={
                typeFilter === "TRANSFER"
                  ? "filter-tab active"
                  : "filter-tab"
              }
              onClick={() =>
                handleTypeFilter("TRANSFER")
              }
            >
              Transfers
            </button>

            <button
              type="button"
              className={
                typeFilter === "WITHDRAW"
                  ? "filter-tab active"
                  : "filter-tab"
              }
              onClick={() =>
                handleTypeFilter("WITHDRAW")
              }
            >
              Withdrawals
            </button>

          </div>

          {/* DATE */}

          <div className="date-filter">

            <input
              type="date"
              value={dateFilter}
              onChange={handleDateChange}
              aria-label="Filter by date"
            />

            <button
              type="button"
              className="apply-filter-btn"
              onClick={applyFilter}
            >
              Apply
            </button>

            <button
              type="button"
              className="clear-filter-btn"
              onClick={clearFilters}
            >
              Clear
            </button>

          </div>

        </section>

        {/* TRANSACTION LIST */}

        <section className="transaction-list">

          {/* LOADING */}

          {loading && (
            <div className="transaction-empty">

              <h3>
                Loading transactions
              </h3>

              <p>
                Please wait while we load
                your transaction history.
              </p>

            </div>
          )}

          {/* ERROR */}

          {!loading &&
            errorMessage && (

              <div className="transaction-empty">

                <h3>
                  Unable to load transactions
                </h3>

                <p>
                  {errorMessage}
                </p>

                <button
                  type="button"
                  className="load-btn"
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  Try Again
                </button>

              </div>
            )}

          {/* NO TRANSACTIONS */}

          {!loading &&
            !errorMessage &&
            filteredTransactions.length === 0 && (

              <div className="transaction-empty">

                <div className="empty-icon">
                  —
                </div>

                <h3>
                  No transactions found
                </h3>

                <p>
                  There are no transactions
                  matching your selected filters.
                </p>

              </div>
            )}

          {/* TRANSACTIONS */}

          {!loading &&
            !errorMessage &&
            filteredTransactions.length > 0 && (

              visibleTransactions.map(
                (transaction) => {

                  const credit =
                    isCredit(transaction);

                  const transactionClass =
                    getTransactionClass(
                      transaction
                    );

                  return (
                    <article
                      className="transaction-row"
                      key={
                        transaction.transaction_id
                      }
                    >

                      {/* ICON */}

                      <div
                        className={`transaction-icon ${transactionClass}`}
                        aria-hidden="true"
                      >
                        {credit
                          ? "↓"
                          : "↑"}
                      </div>

                      {/* INFORMATION */}

                      <div className="transaction-info">

                        <div className="transaction-label">
                          {getTransactionLabel(
                            transaction
                          )}
                        </div>

                        <div className="transaction-name">
                          {getTransactionName(
                            transaction
                          )}
                        </div>

                        <div className="transaction-date">

                          {formatDate(
                            transaction.created_at
                          )}

                          <span className="date-separator">
                            •
                          </span>

                          {formatTime(
                            transaction.created_at
                          )}

                        </div>

                      </div>

                      {/* AMOUNT */}

                      <div className="transaction-amount-section">

                        <div
                          className={
                            credit
                              ? "transaction-amount credit-amount"
                              : "transaction-amount debit-amount"
                          }
                        >

                          {credit
                            ? "+"
                            : "-"}

                          {" ₹"}

                          {Number(
                            transaction.amount || 0
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}

                        </div>

                        <div className="transaction-account-type">
                          {getAccountType(
                            transaction
                          )}
                        </div>

                      </div>

                    </article>
                  );
                }
              )
            )}

        </section>

        {/* LOAD MORE */}

        {!loading &&
          !errorMessage &&
          filteredTransactions.length >
            visibleCount && (

            <div className="load-more-container">

              <button
                type="button"
                className="load-more-btn"
                onClick={loadMore}
              >
                Load More
              </button>

            </div>
          )}

      </main>

    </div>
  );
}

export default Transactions;