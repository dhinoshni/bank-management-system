import "./transactions.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Transactions() {

    const navigate = useNavigate();

    // STATES
    const [allTransactions,
        setAllTransactions] = useState([]);

    const [filteredTransactions,
        setFilteredTransactions] = useState([]);

    const [typeFilter,
        setTypeFilter] =
        useState("All Types");

    const [dateFilter,
        setDateFilter] =
        useState("");

    const [visibleCount,
        setVisibleCount] =
        useState(5);

    // FETCH DB TRANSACTIONS
    useEffect(() => {

        axios
            .get(
                "http://127.0.0.1:5000/transactions"
            )

            .then((res) => {

                if (
                    res.data.status === "success"
                ) {

                    // REMOVE DUPLICATES
                    const uniqueTransactions =
                        res.data.data.filter(
                            (
                                value,
                                index,
                                self
                            ) =>

                                index ===
                                self.findIndex(
                                    (t) =>
                                        t.transaction_id ===
                                        value.transaction_id
                                )
                        );

                    setAllTransactions(
                        uniqueTransactions
                    );

                    setFilteredTransactions(
                        uniqueTransactions
                    );
                }
            })

            .catch((err) =>
                console.log(err)
            );

    }, []);

    // APPLY FILTER
    const applyFilter = () => {

        let filtered = allTransactions;

        // TYPE FILTER
        if (
            typeFilter !== "All Types"
        ) {

            filtered = filtered.filter(
                (t) =>
                    t.transaction_type ===
                    typeFilter.toUpperCase()
            );
        }

        // DATE FILTER
        if (dateFilter !== "") {

            filtered = filtered.filter(
                (t) => {

                    const transactionDate =
                        new Date(
                            t.created_at
                        )
                            .toISOString()
                            .split("T")[0];

                    return (
                        transactionDate ===
                        dateFilter
                    );
                }
            );
        }

        setFilteredTransactions(
            filtered
        );

        setVisibleCount(5);
    };

    // LOAD MORE
    const loadMore = () => {

        setVisibleCount(
            visibleCount + 5
        );
    };

    // DOWNLOAD PDF
    const downloadStatement = () => {

        const doc = new jsPDF();

        doc.text(
            "Bank Transaction Statement",
            14,
            15
        );

        autoTable(doc, {

            startY: 25,

            head: [[
                "Name",
                "Date",
                "Type",
                "Amount",
                "Balance"
            ]],

            body:
                filteredTransactions.map(
                    (t) => [

                        t.sender_name ||
                        "User",

                        new Date(
                            t.created_at
                        ).toLocaleDateString(),

                        t.transaction_type,

                        `₹ ${t.amount}`,

                        `₹ ${t.balance || 0}`
                    ]
                )

        });

        doc.save(
            "transaction-statement.pdf"
        );
    };

    return (

        <div className="transactions-page">

            {/* HEADER */}
            <div className="transactions-header">

                {/* BACK */}
                <button
                    className="back-btn"
                    onClick={() =>
                        navigate(
                            "/dashboard"
                        )
                    }
                >
                    ❮
                </button>

                {/* TITLE */}
                <h2 className="transaction-title-header">
                    Transaction History
                </h2>

            </div>

            {/* CARD */}
            <div className="transactions-card">

                {/* FILTERS */}
                <div className="filter-section">

                    {/* TYPE */}
                    <select
                        value={typeFilter}
                        onChange={(e) =>
                            setTypeFilter(
                                e.target.value
                            )
                        }
                    >

                        <option>
                            All Types
                        </option>

                        <option>
                            Deposit
                        </option>

                        <option>
                            Withdraw
                        </option>

                        <option>
                            Transfer
                        </option>

                    </select>

                    {/* DATE */}
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) =>
                            setDateFilter(
                                e.target.value
                            )
                        }
                    />

                    {/* FILTER BUTTON */}
                    <button
                        className="filter-btn"
                        onClick={
                            applyFilter
                        }
                    >
                        Apply Filter
                    </button>

                </div>

                {/* TABLE */}
                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>Name</th>

                                <th>Date</th>

                                <th>Type</th>

                                <th>Amount</th>

                                <th>Balance</th>

                            </tr>

                        </thead>

                        <tbody>

                            {
                                filteredTransactions
                                    .slice(
                                        0,
                                        visibleCount
                                    )
                                    .map(
                                        (
                                            t,
                                            index
                                        ) => (

                                    <tr
                                        key={
                                            index
                                        }
                                    >

                                        {/* NAME */}
                                        <td>

                                            {
                                                t.sender_name ||
                                                "User"
                                            }

                                        </td>

                                        {/* DATE */}
                                        <td>

                                            {
                                                new Date(
                                                    t.created_at
                                                ).toLocaleDateString()
                                            }

                                        </td>

                                        {/* TYPE */}
                                        <td>

                                            <span
                                                className={
                                                    t.transaction_type ===
                                                    "DEPOSIT"
                                                        ? "deposit"
                                                        : "withdraw"
                                                }
                                            >

                                                {
                                                    t.transaction_type
                                                }

                                            </span>

                                        </td>

                                        {/* AMOUNT */}
                                        <td
                                            className={
                                                t.transaction_type ===
                                                "DEPOSIT"
                                                    ? "credit"
                                                    : "debit"
                                            }
                                        >

                                            ₹ {t.amount}

                                        </td>

                                        {/* BALANCE */}
                                        <td>

                                            ₹ {
                                                t.balance ||
                                                0
                                            }

                                        </td>

                                    </tr>

                                ))
                            }

                        </tbody>

                    </table>

                </div>

                {/* BUTTONS */}
                <div className="bottom-buttons">

                    {/* LOAD MORE */}
                    {
                        visibleCount <
                        filteredTransactions.length && (

                            <button
                                className="load-btn"
                                onClick={
                                    loadMore
                                }
                            >
                                Load More
                            </button>

                        )
                    }

                    {/* DOWNLOAD */}
                    <button
                        className="download-btn"
                        onClick={
                            downloadStatement
                        }
                    >
                        Download Statement
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Transactions;