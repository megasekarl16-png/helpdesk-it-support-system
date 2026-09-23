import { API_URL } from "../config";
import { useState } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";
import "../styles/new-ticket.css";

function NewTicket() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    priority: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (event) => {
  event.preventDefault();

  if (
  !formData.title.trim() ||
  !formData.category ||
  !formData.priority ||
  !formData.description.trim()
) {
  setError("Please complete all required fields.");
  return;
}

  setError("");
  setSubmitting(true);

  try {
    const response = await fetch(
      `${API_URL}/api/tickets`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            "token"
          )}`,
        },

        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to submit ticket.");
    }

    const savedTicket = await response.json();

    console.log("Saved Ticket:", savedTicket);

    navigate("/tickets", {
      state: {
        successMessage:
          "Ticket created successfully.",
      },
    });
  } catch (error) {
    console.error(error);

    setError(
      "Unable to submit ticket. Please try again."
    );

    setSubmitting(false);
  }
};

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        <header className="new-ticket-header">

          <div>
            <button
              className="back-button"
              onClick={() => navigate("/tickets")}
            >
              ← Back to Tickets
            </button>

            <p className="dashboard-eyebrow">
              SUPPORT
            </p>

            <h1>Create New Ticket</h1>

            <p>
              Tell us about the issue you're experiencing.
              Our IT team will review your request.
            </p>
          </div>

        </header>


        <div className="new-ticket-layout">

          <section className="new-ticket-card">

            <div className="form-section-header">
              <h2>Ticket Information</h2>

              <p>
                Provide as much detail as possible to help
                our support team resolve your issue.
              </p>
            </div>


            <form onSubmit={handleSubmit}>

              <div className="ticket-form-group">
                <label htmlFor="title">
                  Issue Title
                  <span>*</span>
                </label>

                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Cannot connect to office Wi-Fi"
                />
              </div>


              <div className="ticket-form-row">

                <div className="ticket-form-group">
                  <label htmlFor="category">
                    Category
                    <span>*</span>
                  </label>

                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select category
                    </option>

                    <option value="Hardware">
                      Hardware
                    </option>

                    <option value="Software">
                      Software
                    </option>

                    <option value="Network">
                      Network
                    </option>

                    <option value="Account">
                      Account
                    </option>
                  </select>
                </div>


                <div className="ticket-form-group">
                  <label htmlFor="priority">
                    Priority
                    <span>*</span>
                  </label>

                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select priority
                    </option>

                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>
                  </select>
                </div>

              </div>


              <div className="ticket-form-group">
                <label htmlFor="description">
                  Description
                  <span>*</span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue, when it started, and any error messages you've seen..."
                  rows="7"
                />

                <small>
                  Include relevant details that may help
                  the IT team investigate the issue.
                </small>
              </div>


              {error && (
                <div className="ticket-form-error">
                  {error}
                </div>
              )}


              <div className="ticket-form-actions">

                <button
  type="button"
  className="cancel-ticket-button"
  onClick={() => navigate("/tickets")}
  disabled={submitting}
>
  Cancel
</button>

                <button
  type="submit"
  className="submit-ticket-button"
  disabled={submitting}
>
  {submitting ? (
    "Submitting..."
  ) : (
    <>
      Submit Ticket
      <span>→</span>
    </>
  )}
</button>

              </div>

            </form>

          </section>


          <aside className="ticket-help-card">

            <div className="help-icon">
              ?
            </div>

            <h3>Before submitting</h3>

            <p>
              Providing clear information helps our IT
              team resolve your issue faster.
            </p>

            <div className="help-divider"></div>

            <div className="help-tip">
              <span>01</span>

              <div>
                <strong>Use a clear title</strong>
                <p>
                  Briefly describe the main problem.
                </p>
              </div>
            </div>

            <div className="help-tip">
              <span>02</span>

              <div>
                <strong>Choose the right category</strong>
                <p>
                  This helps route your ticket correctly.
                </p>
              </div>
            </div>

            <div className="help-tip">
              <span>03</span>

              <div>
                <strong>Add useful details</strong>
                <p>
                  Mention errors or steps you've already tried.
                </p>
              </div>
            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}

export default NewTicket;

