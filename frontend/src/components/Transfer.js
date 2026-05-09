import "./transfer.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Transfer() {

    const navigate = useNavigate();

    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [success, setSuccess] = useState(false);

    // TRANSFER BUTTON
    const handleTransfer = () => {
        setSuccess(true);
    };

    // SUCCESS SCREEN
    if(success){
        return(

            <div className="success-container">

                <div className="success-card">

                    <div className="success-icon">
                        ✅
                    </div>

                    <h1>Payment Successful!</h1>

                    <p>
                        Thank you for your payment.
                        Your transaction has been
                        completed successfully.
                    </p>

                    <button
                        className="dashboard-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        Go to Dashboard
                    </button>

                </div>

            </div>
        );
    }

    return (

        <div className="transfer-container">

            {/* TOP HEADER */}
            <div className="transfer-header">

                {/* BACK BUTTON */}
                <button
                    className="back-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    ❮
                </button>

                <h2>Transfer Money</h2>

            </div>

            {/* CARD */}
            <div className="transfer-card">

                <h3>Transfer Information</h3>

                {/* FROM ACCOUNT */}
                <div className="form-group">

                    <label>From Account</label>

                    <select>
                        <option>Savings Account</option>
                        <option>Current Account</option>
                    </select>

                </div>

                {/* BENEFICIARY */}
                <div className="form-group">

                    <label>Select Beneficiary</label>

                    <select>
                        <option>Rahul Kumar</option>
                        <option>Sangeetha</option>
                        <option>Arun</option>
                    </select>

                </div>

                {/* AMOUNT */}
                <div className="form-group">

                    <label>Enter Amount</label>

                    <input
                        type="number"
                        placeholder="₹ Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />

                </div>

                {/* NOTE */}
                <div className="form-group">

                    <label>Add Note</label>

                    <textarea
                        placeholder="Enter transfer note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />

                </div>

                {/* BUTTON */}
                <button
                    className="transfer-btn"
                    onClick={handleTransfer}
                >
                    Transfer Now
                </button>

            </div>

        </div>
    );
}

export default Transfer;