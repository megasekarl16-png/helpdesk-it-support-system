import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import Sidebar from "../components/Sidebar";

import "../styles/dashboard.css";
import "../styles/ticket-detail.css";

function TicketDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updating, setUpdating] = useState(false);

  const [assigning, setAssigning] = useState(false);

  const [deleting, setDeleting] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);

const [comments, setComments] = useState([]);
const [commentMessage, setCommentMessage] = useState("");
const [commentsLoading, setCommentsLoading] = useState(true);
const [sendingComment, setSendingComment] = useState(false);
const [commentError, setCommentError] = useState("");

const [activities, setActivities] = useState([]);
const [activitiesLoading, setActivitiesLoading] = useState(true);
const [activityError, setActivityError] = useState("");

const storedUser = localStorage.getItem("user");
const currentUser = storedUser
  ? JSON.parse(storedUser)
  : null;

const canUpdateStatus =
  currentUser?.role === "ADMIN" ||
  (
    currentUser?.role === "IT_SUPPORT" &&
    ticket?.assignedTo?.id === currentUser?.id
  );

const canEditTicket =
  currentUser?.role === "EMPLOYEE" &&
  ticket?.createdBy?.id === currentUser?.id &&
  ticket?.status === "Open";

 const canDeleteTicket =
  currentUser?.role === "ADMIN"; 

const isITSupport =
  currentUser?.role === "IT_SUPPORT";

const isAssignedToCurrentUser =
  ticket?.assignedTo?.id === currentUser?.id;

const hasITSupportMessage =
  comments.some(
    (comment) =>
      comment.user?.role === "IT_SUPPORT"
  );

const isEmployeeOwner =
  currentUser?.role === "EMPLOYEE" &&
  ticket?.createdBy?.id === currentUser?.id;

const canReply =
  (
    isEmployeeOwner &&
    hasITSupportMessage
  ) ||
  (
    currentUser?.role === "IT_SUPPORT" &&
    ticket?.assignedTo?.id === currentUser?.id
  );

  const fetchTicket = async () => {
  try {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8080/api/tickets/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Ticket not found.");
    }

    const data = await response.json();

    setTicket(data);

  } catch (error) {
    console.error(error);

    setError("Unable to load ticket.");

  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchTicket();
}, [id]);

const handleStatusChange = async (newStatus) => {
  try {
    setUpdating(true);
    setError("");

    const response = await fetch(
      `http://localhost:8080/api/tickets/${id}`,
      {
        method: "PUT",

        headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
},

        body: JSON.stringify({
          ...ticket,
          status: newStatus,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update ticket.");
    }

    const updatedTicket = await response.json();
    setTicket(updatedTicket);
    await fetchActivities(); // Fetch updated activities

  } catch (error) {
    console.error(error);
    setError("Unable to update ticket.");

  } finally {
    setUpdating(false);
  }
};

const handleAssignToMe = async () => {
  try {
    setAssigning(true);
    setError("");

    const response = await fetch(
      `http://localhost:8080/api/tickets/${id}/assign`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(
        message || "Failed to assign ticket."
      );
    }

    const updatedTicket = await response.json();

    setTicket(updatedTicket);
    
    await fetchActivities();

  } catch (error) {
    console.error(error);

    setError(
      error.message || "Unable to assign ticket."
    );

  } finally {
    setAssigning(false);
  }
};

const handleDelete = async () => {
  try {
    setDeleting(true);
    setError("");

    const response = await fetch(
  `http://localhost:8080/api/tickets/${id}`,
  {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

    if (!response.ok) {
      throw new Error("Failed to delete ticket.");
    }

    navigate("/tickets");

  } catch (error) {
    console.error(error);
    setError("Unable to delete ticket.");

  } finally {
    setDeleting(false);
  }
};

const fetchComments = async () => {
  try {
    setCommentsLoading(true);
    setCommentError("");

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8080/api/tickets/${id}/comments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load conversation.");
    }

    const data = await response.json();

    setComments(data);

  } catch (error) {
    console.error(error);
    setCommentError("Unable to load conversation.");

  } finally {
    setCommentsLoading(false);
  }
};

useEffect(() => {
  fetchComments();
}, [id]);

const fetchActivities = async () => {
  try {
    setActivitiesLoading(true);
    setActivityError("");

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8080/api/tickets/${id}/activities`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load activity.");
    }

    const data = await response.json();
    setActivities(data);
  } catch (error) {
    console.error(error);
    setActivityError("Unable to load ticket activity.");
  } finally {
    setActivitiesLoading(false);
  }
};

useEffect(() => {
  fetchActivities();
}, [id]);

const handleSendComment = async (event) => {
  event.preventDefault();

  if (!commentMessage.trim()) {
    return;
  }

  try {
    setSendingComment(true);
    setCommentError("");

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8080/api/tickets/${id}/comments`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          message: commentMessage.trim(),
        }),
      }
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(
        message || "Failed to send reply."
      );
    }

    const newComment = await response.json();

    setComments((previousComments) => [
      ...previousComments,
      newComment,
    ]);

    setCommentMessage("");

  } catch (error) {
    console.error(error);

    setCommentError(
      error.message || "Unable to send reply."
    );

  } finally {
    setSendingComment(false);
  }
};

const getActivityTitle = (action) => {
  switch (action) {
    case "CREATED":
      return "Ticket created";

    case "ASSIGNED":
      return "Ticket assigned";

    case "STATUS_CHANGED":
      return "Status changed";

    case "EDITED":
  return "Ticket edited";

    default:
      return "Ticket updated";
  }
};

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        <button
          className="back-button"
          onClick={() => navigate("/tickets")}
        >
          ← Back to Tickets
        </button>

        {loading && (
  <div className="ticket-detail-loading">
    <div className="ticket-detail-spinner"></div>

    <div>
      <strong>Loading ticket</strong>
      <p>Please wait while we retrieve the ticket details.</p>
    </div>
  </div>
)}

        {error && !loading && (
  <div className="ticket-detail-error">

    <div className="ticket-detail-error-icon">
      !
    </div>

    <div>
      <strong>Unable to load ticket</strong>

      <p>
        We couldn't retrieve this ticket.
        Please check your connection and try again.
      </p>

      <button
        type="button"
        onClick={fetchTicket}
        className="ticket-detail-retry-button"
      >
        Try Again
      </button>
    </div>

  </div>
)}

        {!loading && !error && ticket && (
          <>

            <header className="ticket-detail-header">

              <div>
                <p className="dashboard-eyebrow">
                  TICKET DETAILS
                </p>

                <div className="ticket-detail-title">
                  <span>
                    #HD-{String(ticket.id).padStart(4, "0")}
                  </span>

                  <h1>{ticket.title}</h1>
                </div>

                <p>
                  Created{" "}
                  {new Date(
                    ticket.createdAt
                  ).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>

              <div className="ticket-detail-header-actions">

  {canEditTicket && (
    <button
      type="button"
      className="edit-ticket-button"
      onClick={() =>
        navigate(`/tickets/${ticket.id}/edit`)
      }
    >
      Edit Ticket
    </button>
  )}

  <span
    className={`table-status ${ticket.status
      .toLowerCase()
      .replace(" ", "-")}`}
  >
    {ticket.status}
  </span>

</div>

            </header>


            <div className="ticket-detail-layout">

              <div className="ticket-detail-left">

<section className="ticket-detail-card">

                <div className="detail-section">
                  <h2>Issue Description</h2>

                  <p className="ticket-description">
                    {ticket.description}
                  </p>
                </div>

            {canUpdateStatus && (
  <div className="status-update-section">

    <div>
      <h2>Update Status</h2>

      <p>
        Change the current progress of this support ticket.
      </p>
    </div>

    <select
      value={ticket.status}
      disabled={updating}
      onChange={(event) =>
        handleStatusChange(event.target.value)
      }
    >
      <option value="Open">
        Open
      </option>

      <option value="In Progress">
        In Progress
      </option>

      <option value="Resolved">
        Resolved
      </option>
    </select>

  </div>
)}

              </section>



<div className="activity-card">
  <div className="activity-header">
    <div>
      <h2>Activity</h2>
      <p>History of changes made to this ticket.</p>
    </div>
  </div>

  {activitiesLoading && (
    <p className="activity-state">Loading activity...</p>
  )}

  {activityError && !activitiesLoading && (
  <div className="activity-error-state">

    <div className="activity-error-icon">
      !
    </div>

    <div>
      <strong>Unable to load activity</strong>

      <p>
        We couldn't retrieve the activity history for this ticket.
      </p>

      <button
        type="button"
        className="activity-retry-button"
        onClick={fetchActivities}
      >
        Try Again
      </button>
    </div>

  </div>
)}

  {!activitiesLoading &&
    !activityError &&
    activities.length === 0 && (
      <p className="activity-state">
        No activity recorded yet.
      </p>
    )}

  {!activitiesLoading &&
    !activityError &&
    activities.length > 0 && (
      <div className="activity-timeline">
        {activities.map((activity) => (
          <div
            className="activity-item"
            key={activity.id}
          >
            <div className="activity-marker">
              <span className="activity-dot"></span>
            </div>

            <div className="activity-content">
              <div className="activity-title">
                {getActivityTitle(activity.action)}
              </div>

              <div className="activity-description">
                {activity.description}
              </div>

              <div className="activity-meta">
                <span>
                  {activity.user?.name || "System"}
                </span>

                <span>•</span>

                <span>
                  {activity.user?.role
                    ?.replace("_", " ") || "SYSTEM"}
                </span>

                <span>•</span>

                <span>
                  {new Date(
                    activity.createdAt
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
</div>

</div>

              <div className="ticket-detail-right">

<aside className="ticket-information-card">

                <h2>Ticket Information</h2>

                <div className="detail-info-item">
                  <span>Category</span>

                  <strong>
                    {ticket.category}
                  </strong>
                </div>

                <div className="detail-info-item">
                  <span>Priority</span>

                  <strong
                    className={`detail-priority ${ticket.priority.toLowerCase()}`}
                  >
                    {ticket.priority}
                  </strong>
                </div>

                <div className="detail-info-item">
                  <span>Status</span>

                  <strong>
                    {ticket.status}
                  </strong>
                </div>

<div className="detail-info-item">
  <span>Created By</span>

  <strong>
    {ticket.createdBy
      ? ticket.createdBy.name
      : "Unknown"}
  </strong>
</div>

<div className="detail-info-item">
  <span>Assigned To</span>

  <strong>
    {ticket.assignedTo
      ? ticket.assignedTo.name
      : "Unassigned"}
  </strong>
</div>

{isITSupport && !ticket.assignedTo && (
  <button
    className="assign-ticket-button"
    disabled={assigning}
    onClick={handleAssignToMe}
  >
    {assigning
      ? "Assigning..."
      : "Assign to Me"}
  </button>
)}

{isITSupport && isAssignedToCurrentUser && (
  <div className="assigned-to-you">
    ✓ Assigned to You
  </div>
)}

                <div className="detail-info-item">
                  <span>Ticket ID</span>

                  <strong>
                    #HD-{String(ticket.id).padStart(4, "0")}
                  </strong>
                </div>

                {canDeleteTicket && (
  <div className="ticket-danger-zone">

    <span>Danger Zone</span>

    <p>
      Permanently delete this support ticket.
    </p>

    <button
      onClick={() => setShowDeleteModal(true)}
    >
      Delete Ticket
    </button>

  </div>
)}

              </aside>

<section className="conversation-card">

  <div className="conversation-header">
    <div>
      <h2>Conversation</h2>
      <p>
        Follow updates and communicate about this ticket.
      </p>
    </div>

    <span className="conversation-count">
      {comments.length}{" "}
      {comments.length === 1 ? "Reply" : "Replies"}
    </span>
  </div>


  {commentsLoading && (
    <div className="conversation-message">
      Loading conversation...
    </div>
  )}


  {commentError && !commentsLoading && (
  <div className="conversation-error-state">

    <div className="conversation-error-icon">
      !
    </div>

    <div>
      <strong>Unable to load conversation</strong>

      <p>
        We couldn't retrieve the conversation for this ticket.
      </p>

      <button
        type="button"
        className="conversation-retry-button"
        onClick={fetchComments}
      >
        Try Again
      </button>
    </div>

  </div>
)}

 {!commentsLoading &&
  !commentError &&
  comments.length === 0 && (
    <div className="conversation-empty">

      <div className="conversation-empty-icon">
        {isEmployeeOwner ? "🔒" : "◌"}
      </div>

      {isEmployeeOwner ? (
        <>
          <h3>
            {ticket?.assignedTo
              ? "Waiting for IT Support"
              : "Conversation not available yet"}
          </h3>

          <p>
            {ticket?.assignedTo
              ? "Your ticket has been assigned. An IT Support agent will start the conversation if additional information is needed."
              : "Your ticket hasn't been picked up by IT Support yet. Conversation will become available after an IT Support agent responds to your ticket."}
          </p>
        </>
      ) : (
        <>
          <h3>No replies yet</h3>

          <p>
            Start the conversation about this ticket.
          </p>
        </>
      )}

    </div>
)}


  {!commentsLoading &&
    comments.length > 0 && (
      <div className="conversation-list">

        {comments.map((comment) => {

          const isCurrentUser =
            comment.user?.id === currentUser?.id;

          return (
            <div
              key={comment.id}
              className={`conversation-item ${
                isCurrentUser ? "mine" : ""
              }`}
            >

              <div className="conversation-author">

                <div className="conversation-avatar">
                  {comment.user?.name
                    ?.charAt(0)
                    ?.toUpperCase() || "?"}
                </div>

                <div>
                  <strong>
                    {comment.user?.name || "Unknown User"}
                  </strong>

                  <span>
                    {comment.user?.role
                      ?.replace("_", " ") || "USER"}
                  </span>
                </div>

              </div>


              <div className="conversation-bubble">

                <p>{comment.message}</p>

                <time>
                  {new Date(
                    comment.createdAt
                  ).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>

              </div>

            </div>
          );
        })}

      </div>
    )}


  {canReply ? (

    <form
      className="conversation-reply"
      onSubmit={handleSendComment}
    >

      <label htmlFor="comment-message">
        Write a reply
      </label>

      <textarea
        id="comment-message"
        placeholder="Type your message here..."
        value={commentMessage}
        onChange={(event) =>
          setCommentMessage(event.target.value)
        }
        rows="4"
        maxLength="2000"
      />

      <div className="conversation-reply-footer">

        <span>
          {commentMessage.length}/2000
        </span>

        <button
          type="submit"
          disabled={
            sendingComment ||
            !commentMessage.trim()
          }
        >
          {sendingComment
            ? "Sending..."
            : "Send Reply"}
        </button>

      </div>

    </form>

  ) : (

    <div className="conversation-readonly">

  {currentUser?.role === "ADMIN"
    ? "Conversation is read-only for administrators."

    : currentUser?.role === "IT_SUPPORT" &&
      !ticket?.assignedTo
    ? "Assign this ticket to yourself to start the conversation."

    : isEmployeeOwner &&
      !ticket?.assignedTo
    ? "Waiting for an IT Support agent to pick up your ticket."

    : isEmployeeOwner &&
      !hasITSupportMessage
    ? "Waiting for IT Support to start the conversation."

    : "You can view this conversation, but cannot reply."}

</div>

  )}

</section>

</div>

            </div>

          </>
        )}

      </main>

{showDeleteModal && (
  <div className="delete-modal-overlay">

    <div className="delete-modal">

      <div className="delete-modal-icon">
        !
      </div>

      <h2>Delete this ticket?</h2>

      <p>
        This action cannot be undone. Ticket{" "}
        <strong>
          #HD-{String(ticket.id).padStart(4, "0")}
        </strong>{" "}
        will be permanently deleted.
      </p>

      <div className="delete-modal-actions">

        <button
          className="modal-cancel-button"
          disabled={deleting}
          onClick={() => setShowDeleteModal(false)}
        >
          Cancel
        </button>

        <button
          className="modal-delete-button"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting
            ? "Deleting..."
            : "Delete Ticket"}
        </button>

      </div>

    </div>

  </div>
)}

    </div>
  );
}

export default TicketDetail;
