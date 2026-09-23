import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser
    ? JSON.parse(storedUser)
    : null;

  const role = currentUser?.role;

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
};

const getDashboardSubtitle = () => {
  if (role === "IT_SUPPORT") {
    return "Here's what's happening with tickets requiring support.";
  }

  if (role === "ADMIN") {
    return "Here's an overview of HelpDesk activity.";
  }

  return "Here's what's happening with your support requests today.";
};

  const fetchTickets = async () => {
  try {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:8080/api/tickets",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load dashboard.");
    }

    const data = await response.json();

    setTickets(data);
  } catch (error) {
    console.error(error);

    setError(
      "Unable to load dashboard data. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchTickets();
}, []);


  // =========================
  // DASHBOARD STATISTICS
  // =========================

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "Resolved"
  ).length;

  const urgentTickets = tickets.filter(
    (ticket) =>
      ticket.priority?.toLowerCase() === "high" &&
      ticket.status !== "Resolved"
  ).length;

  const totalTickets = tickets.length;

const unassignedTickets = tickets.filter(
  (ticket) =>
    !ticket.assignedTo &&
    ticket.status !== "Resolved"
).length;

const assignedToMeTickets = tickets.filter(
  (ticket) =>
    ticket.assignedTo?.id === currentUser?.id
).length;

const highPriorityTickets = tickets.filter(
  (ticket) =>
    ticket.priority?.toLowerCase() === "high"
).length;

const mediumPriorityTickets = tickets.filter(
  (ticket) =>
    ticket.priority?.toLowerCase() === "medium"
).length;

const lowPriorityTickets = tickets.filter(
  (ticket) =>
    ticket.priority?.toLowerCase() === "low"
).length;

const resolutionRate =
  totalTickets > 0
    ? Math.round(
        (resolvedTickets / totalTickets) * 100
      )
    : 0;

const getPriorityPercentage = (count) => {
  if (totalTickets === 0) {
    return 0;
  }

  return Math.round(
    (count / totalTickets) * 100
  );
};

let dashboardStats = [];

if (role === "EMPLOYEE") {
  dashboardStats = [
    {
      title: "Open Tickets",
      value: openTickets,
      description: "Waiting for support",
      icon: "○",
      variant: "green",
    },
    {
      title: "In Progress",
      value: inProgressTickets,
      description: "Currently being handled",
      icon: "◷",
      variant: "blue",
    },
    {
      title: "Resolved",
      value: resolvedTickets,
      description: "Successfully completed",
      icon: "✓",
      variant: "purple",
    },
    {
      title: "Urgent",
      value: urgentTickets,
      description: "High priority unresolved",
      icon: "!",
      variant: "red",
    },
  ];
}

if (role === "IT_SUPPORT") {
  dashboardStats = [
    {
      title: "Total Tickets",
      value: totalTickets,
      description: "All support requests",
      icon: "▣",
      variant: "green",
    },
    {
      title: "Unassigned",
      value: unassignedTickets,
      description: "Waiting to be assigned",
      icon: "○",
      variant: "red",
    },
    {
      title: "Assigned to Me",
      value: assignedToMeTickets,
      description: "Tickets assigned to you",
      icon: "◷",
      variant: "blue",
    },
    {
      title: "Resolved",
      value: resolvedTickets,
      description: "Successfully completed",
      icon: "✓",
      variant: "purple",
    },
  ];
}

if (role === "ADMIN") {
  dashboardStats = [
    {
      title: "Total Tickets",
      value: totalTickets,
      description: "All support requests",
      icon: "▣",
      variant: "green",
    },
    {
      title: "Open Tickets",
      value: openTickets,
      description: "Waiting for support",
      icon: "○",
      variant: "red",
    },
    {
      title: "In Progress",
      value: inProgressTickets,
      description: "Currently being handled",
      icon: "◷",
      variant: "blue",
    },
    {
      title: "Resolved",
      value: resolvedTickets,
      description: "Successfully completed",
      icon: "✓",
      variant: "purple",
    },
  ];
}

  // =========================
  // RECENT TICKETS
  // =========================

  const recentTickets = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    )
    .slice(0, 3);

  const unassignedQueue = tickets
  .filter(
    (ticket) =>
      !ticket.assignedTo &&
      ticket.status !== "Resolved"
  )
  .sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  )
  .slice(0, 5);

const myActiveTickets = tickets
  .filter(
    (ticket) =>
      ticket.assignedTo?.id === currentUser?.id &&
      ticket.status !== "Resolved"
  )
  .sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  )
  .slice(0, 5);


  // =========================
  // DATE FORMAT
  // =========================

  const formatTicketDate = (createdAt) => {
    const ticketDate = new Date(createdAt);
    const today = new Date();

    const todayString =
      today.toDateString();

    const ticketDateString =
      ticketDate.toDateString();

    if (ticketDateString === todayString) {
      return "Today";
    }

    const yesterday = new Date();
    yesterday.setDate(
      yesterday.getDate() - 1
    );

    if (
      ticketDateString ===
      yesterday.toDateString()
    ) {
      return "Yesterday";
    }

    return ticketDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };


  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <p className="dashboard-eyebrow">
              DASHBOARD
            </p>

            <h1>
  {getGreeting()},{" "}
  {currentUser?.name?.split(" ")[0] || "User"} 👋
</h1>

<p>
  {getDashboardSubtitle()}
</p>
          </div>

          <div className="header-actions">

  {role === "EMPLOYEE" && (
    <button
      className="new-ticket-button"
      onClick={() =>
        navigate("/tickets/new")
      }
    >
      + New Ticket
    </button>
  )}

</div>

        </header>


        {error && !loading && (
  <div className="dashboard-error-state">

    <div className="dashboard-error-icon">
      !
    </div>

    <div>
      <strong>Unable to load dashboard</strong>

      <p>
        We couldn't retrieve the latest HelpDesk data.
        Please check your connection and try again.
      </p>

      <button
        type="button"
        className="dashboard-retry-button"
        onClick={fetchTickets}
      >
        Try Again
      </button>
    </div>

  </div>
)}


        <section className="stats-grid">

  {dashboardStats.map((stat) => (
    <StatCard
      key={stat.title}
      title={stat.title}
      value={loading || error ? "—" : stat.value}
      description={stat.description}
      icon={stat.icon}
      variant={stat.variant}
    />
  ))}

</section>

{role === "IT_SUPPORT" && (
  <section className="support-work-queue">

    <div className="work-queue-header">
      <div>
        <p className="dashboard-eyebrow">
          WORK QUEUE
        </p>

        <h2>Support Work Queue</h2>

        <p>
          Tickets that currently need your attention.
        </p>
      </div>

      <button
        className="view-all-button"
        onClick={() => navigate("/tickets")}
      >
        View all →
      </button>
    </div>

    <div className="work-queue-grid">

      {/* UNASSIGNED */}
      <div className="work-queue-card">

        <div className="queue-card-header">
          <div>
            <h3>Unassigned Tickets</h3>
            <p>Waiting for a support agent</p>
          </div>

          <span className="queue-count">
            {loading || error ? "—" : unassignedQueue.length}
          </span>
        </div>

        <div className="queue-ticket-list">

          {!loading && !error && unassignedQueue.length === 0 && (
  <div className="queue-empty">
    No unassigned tickets.
  </div>
)}

{!loading &&
  !error &&
  unassignedQueue.length > 0 &&
  unassignedQueue.map((ticket) => (
    <div
      className="queue-ticket"
      key={ticket.id}
      onClick={() =>
        navigate(`/tickets/${ticket.id}`)
      }
    >
      <div className="queue-ticket-main">
        <span className="queue-ticket-id">
          #HD-
          {String(ticket.id).padStart(4, "0")}
        </span>

        <strong>{ticket.title}</strong>
      </div>

      <div className="queue-ticket-info">
        <span
          className={`priority ${ticket.priority?.toLowerCase()}`}
        >
          {ticket.priority}
        </span>

        <span
          className={`ticket-status ${
            ticket.status === "In Progress"
              ? "progress"
              : ticket.status.toLowerCase()
          }`}
        >
          {ticket.status}
        </span>
      </div>
    </div>
  ))}

        </div>
      </div>


      {/* MY ACTIVE */}
      <div className="work-queue-card">

        <div className="queue-card-header">
          <div>
            <h3>My Active Tickets</h3>
            <p>Tickets currently assigned to you</p>
          </div>

          <span className="queue-count">
            {loading || error ? "—" : myActiveTickets.length}
          </span>
        </div>

        <div className="queue-ticket-list">

          {!loading && !error && myActiveTickets.length === 0 && (
  <div className="queue-empty">
    You have no active tickets.
  </div>
)}

{!loading &&
  !error &&
  myActiveTickets.length > 0 &&
  myActiveTickets.map((ticket) => (
    <div
      className="queue-ticket"
      key={ticket.id}
      onClick={() =>
        navigate(`/tickets/${ticket.id}`)
      }
    >
      <div className="queue-ticket-main">
        <span className="queue-ticket-id">
          #HD-
          {String(ticket.id).padStart(4, "0")}
        </span>

        <strong>{ticket.title}</strong>
      </div>

      <div className="queue-ticket-info">
        <span
          className={`priority ${ticket.priority?.toLowerCase()}`}
        >
          {ticket.priority}
        </span>

        <span
          className={`ticket-status ${
            ticket.status === "In Progress"
              ? "progress"
              : ticket.status.toLowerCase()
          }`}
        >
          {ticket.status}
        </span>
      </div>
    </div>
  ))}

        </div>
      </div>

    </div>
  </section>
)}

{role === "ADMIN" && !error && (
  <section className="admin-analytics">

    <div className="admin-analytics-header">
      <div>
        <p className="dashboard-eyebrow">
          ANALYTICS
        </p>

        <h2>Ticket Overview</h2>

        <p>
          Current HelpDesk performance and ticket
          distribution.
        </p>
      </div>
    </div>

    <div className="admin-analytics-grid">

      {/* PRIORITY DISTRIBUTION */}
      <div className="analytics-card">

        <div className="analytics-card-header">
          <div>
            <h3>Priority Distribution</h3>
            <p>
              Tickets grouped by priority level.
            </p>
          </div>

          <span className="analytics-total">
            {totalTickets}
          </span>
        </div>

        <div className="priority-analytics">

          <div className="priority-row">
            <div className="priority-row-header">
              <span>High</span>
              <strong>
                {highPriorityTickets}
              </strong>
            </div>

            <div className="analytics-progress">
              <div
                className="analytics-progress-fill high"
                style={{
                  width: `${getPriorityPercentage(
                    highPriorityTickets
                  )}%`,
                }}
              ></div>
            </div>
          </div>


          <div className="priority-row">
            <div className="priority-row-header">
              <span>Medium</span>
              <strong>
                {mediumPriorityTickets}
              </strong>
            </div>

            <div className="analytics-progress">
              <div
                className="analytics-progress-fill medium"
                style={{
                  width: `${getPriorityPercentage(
                    mediumPriorityTickets
                  )}%`,
                }}
              ></div>
            </div>
          </div>


          <div className="priority-row">
            <div className="priority-row-header">
              <span>Low</span>
              <strong>
                {lowPriorityTickets}
              </strong>
            </div>

            <div className="analytics-progress">
              <div
                className="analytics-progress-fill low"
                style={{
                  width: `${getPriorityPercentage(
                    lowPriorityTickets
                  )}%`,
                }}
              ></div>
            </div>
          </div>

        </div>
      </div>


      {/* RESOLUTION RATE */}
      <div className="analytics-card resolution-card">

        <div className="analytics-card-header">
          <div>
            <h3>Resolution Rate</h3>
            <p>
              Percentage of tickets currently resolved.
            </p>
          </div>
        </div>

        <div className="resolution-content">

          <div className="resolution-percentage">
            {resolutionRate}%
          </div>

          <p>
            <strong>{resolvedTickets}</strong>
            {" "}of{" "}
            <strong>{totalTickets}</strong>
            {" "}tickets resolved
          </p>

          <div className="resolution-progress">
            <div
              className="resolution-progress-fill"
              style={{
                width: `${resolutionRate}%`,
              }}
            ></div>
          </div>

        </div>
      </div>

    </div>
  </section>
)}

        <section className="dashboard-content">

          <div className="recent-tickets">

            <div className="section-header">

              <div>
                <h2>Recent Tickets</h2>

                <p>
  {role === "EMPLOYEE"
    ? "Your latest support requests."
    : role === "IT_SUPPORT"
    ? "Latest incoming support requests."
    : "Latest HelpDesk tickets."}
</p>
              </div>

              <button
                className="view-all-button"
                onClick={() =>
                  navigate("/tickets")
                }
              >
                View all →
              </button>

            </div>


            <div className="ticket-list">

              <div className="recent-ticket-labels">
  <span>Ticket</span>
  <span>Priority</span>
  <span>Status</span>
  <span>Created</span>
</div>

              {loading && (
                <div className="tickets-message">
                  Loading tickets...
                </div>
              )}


              {!loading &&
  !error &&
  recentTickets.length === 0 && (
    <div className="tickets-message">
      No tickets found.
    </div>
)}

              {!loading &&
  !error &&
  recentTickets.map((ticket) => (

                  <div
                    className="ticket-item"
                    key={ticket.id}
                    onClick={() =>
                      navigate(
                        `/tickets/${ticket.id}`
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >

                    <div className="ticket-main">

                      <span className="ticket-id">
                        #HD-
                        {String(ticket.id).padStart(
                          4,
                          "0"
                        )}
                      </span>

                      <strong>
                        {ticket.title}
                      </strong>

                      <span className="ticket-category">
                        {ticket.category}
                      </span>

                    </div>


                    <span
                      className={`priority ${ticket.priority?.toLowerCase()}`}
                    >
                      {ticket.priority?.toUpperCase()}
                    </span>


                    <span
                      className={`ticket-status ${
                        ticket.status === "In Progress"
                          ? "progress"
                          : ticket.status.toLowerCase()
                      }`}
                    >
                      {ticket.status}
                    </span>


                    <span className="ticket-date">
                      {formatTicketDate(
                        ticket.createdAt
                      )}
                    </span>

                  </div>

                ))}

            </div>



          </div>


          <aside className="quick-panel">

            <div className="quick-panel-header">
              <h2>Quick Actions</h2>
              <p>Frequently used actions.</p>
            </div>


            {role === "EMPLOYEE" ? (
  <button
    className="quick-action primary"
    onClick={() =>
      navigate("/tickets/new")
    }
  >
    <span>＋</span>

    <div>
      <strong>Create Ticket</strong>
      <small>Report a new issue</small>
    </div>

    <b>→</b>
  </button>
) : (
  <button
    className="quick-action primary"
    onClick={() =>
      navigate("/tickets")
    }
  >
    <span>◷</span>

    <div>
      <strong>Manage Tickets</strong>
      <small>
        Review and handle support requests
      </small>
    </div>

    <b>→</b>
  </button>
)}


            <button className="quick-action">
              <span>?</span>

              <div>
                <strong>Knowledge Base</strong>
                <small>
                  Find common solutions
                </small>
              </div>

              <b>→</b>
            </button>


            <button
              className="quick-action"
              onClick={() =>
                navigate("/tickets")
              }
            >
              <span>◷</span>

              <div>
                <strong>Ticket History</strong>
                <small>
  {role === "EMPLOYEE"
    ? "View your previous requests"
    : "View all support requests"}
</small>
              </div>

              <b>→</b>
            </button>

          </aside>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
