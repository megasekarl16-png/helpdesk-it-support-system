import { API_URL } from "../config";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import Sidebar from "../components/Sidebar";

import "../styles/dashboard.css";
import "../styles/new-ticket.css";

function EditTicket() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    priority: "",
    description: "",
  });

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/tickets/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "token"
              )}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load ticket.");
        }

        const data = await response.json();

        const storedUser = localStorage.getItem("user");
        const currentUser = storedUser
          ? JSON.parse(storedUser)
          : null;

        // Frontend protection:
        // hanya Employee pemilik ticket yang boleh edit.
        if (
          currentUser?.role !== "EMPLOYEE" ||
          data.createdBy?.id !== currentUser?.id
        ) {
          navigate(`/tickets/${id}`, {
            replace: true,
          });
          return;
        }

        // Ticket yang sudah diproses tidak boleh diedit.
        if (data.status !== "Open") {
          navigate(`/tickets/${id}`, {
            replace: true,
          });
          return;
        }

        setTicket(data);

        setFormData({
          title: data.title || "",
          category: data.category || "",
          priority: data.priority || "",
          description: data.description || "",
        });
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load this ticket. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
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

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/tickets/${id}`,
        {
          method: "PUT",

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
        if (response.status === 409) {
          throw new Error(
            "This ticket can no longer be edited because it is already being processed."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to edit this ticket."
          );
        }

        throw new Error(
          "Unable to update ticket. Please try again."
        );
      }

      navigate(`/tickets/${id}`, {
        state: {
          successMessage:
            "Ticket updated successfully.",
        },
      });
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to update ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">

        {loading && (
          <div className="tickets-message">
            Loading ticket...
          </div>
        )}

        {!loading && error && !ticket && (
          <div className="tickets-message error">
            {error}
          </div>
        )}

        {!loading && ticket && (
          <>
            <header className="new-ticket-header">

              <div>
                <button
                  type="button"
                  className="back-button"
                  onClick={() =>
                    navigate(`/tickets/${id}`)
                  }
                >
                  ← Back to Ticket
                </button>

                <p className="dashboard-eyebrow">
                  SUPPORT
                </p>

                <h1>Edit Ticket</h1>

                <p>
                  Update the information for your support
                  request before it is processed by IT Support.
                </p>
              </div>

            </header>

            <div className="new-ticket-layout">

              <section className="new-ticket-card">

                <div className="form-section-header">
                  <h2>Ticket Information</h2>

                  <p>
                    Make the necessary changes to your
                    support request.
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
                      placeholder="Describe the issue..."
                      rows="7"
                    />

                    <small>
                      Update any incorrect or missing
                      information before IT Support begins
                      working on your ticket.
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
                      disabled={submitting}
                      onClick={() =>
                        navigate(`/tickets/${id}`)
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="submit-ticket-button"
                      disabled={submitting}
                    >
                      {submitting ? (
                        "Saving..."
                      ) : (
                        <>
                          Save Changes
                          <span>→</span>
                        </>
                      )}
                    </button>

                  </div>

                </form>

              </section>

              <aside className="ticket-help-card">

                <div className="help-icon">
                  ✎
                </div>

                <h3>Editing ticket</h3>

                <p>
                  You can edit this ticket while it is
                  still open and has not started being
                  processed.
                </p>

                <div className="help-divider"></div>

                <div className="help-tip">
                  <span>01</span>

                  <div>
                    <strong>Check your title</strong>
                    <p>
                      Make sure it clearly describes the
                      issue.
                    </p>
                  </div>
                </div>

                <div className="help-tip">
                  <span>02</span>

                  <div>
                    <strong>Review the category</strong>
                    <p>
                      Choose the category that best matches
                      your problem.
                    </p>
                  </div>
                </div>

                <div className="help-tip">
                  <span>03</span>

                  <div>
                    <strong>Update the details</strong>
                    <p>
                      Correct any missing or inaccurate
                      information.
                    </p>
                  </div>
                </div>

              </aside>

            </div>
          </>
        )}

      </main>
    </div>
  );
}

export default EditTicket;

