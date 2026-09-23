import { API_URL } from "../config";
import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate
} from "react-router";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";
import "../styles/tickets.css";

function Tickets() {
    const navigate = useNavigate();

    const location = useLocation();

const [successMessage, setSuccessMessage] =
  useState(location.state?.successMessage || "");

    const storedUser = localStorage.getItem("user");
const currentUser = storedUser
  ? JSON.parse(storedUser)
  : null;

const isEmployee =
  currentUser?.role === "EMPLOYEE";

const isITSupport =
  currentUser?.role === "IT_SUPPORT";

const isAdmin =
  currentUser?.role === "ADMIN";

const canViewRequester =
  isITSupport || isAdmin;

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
const [priorityFilter, setPriorityFilter] = useState("All Priority");
const [assignmentFilter, setAssignmentFilter] = useState("All Tickets");
const [currentPage, setCurrentPage] = useState(1);

const [tickets, setTickets] = useState([]);
const [loading, setLoading] = useState(true);
const [fetchError, setFetchError] = useState("");

const ticketsPerPage = 5;

useEffect(() => {
  if (!successMessage) return;

  const timer = setTimeout(() => {
    setSuccessMessage("");

    navigate(location.pathname, {
      replace: true,
      state: {},
    });
  }, 3500);

  return () => clearTimeout(timer);
}, [
  successMessage,
  navigate,
  location.pathname,
]);

const fetchTickets = async () => {
  try {
    setLoading(true);
    setFetchError("");

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/tickets`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load tickets.");
    }

    const data = await response.json();

    setTickets(data);

  } catch (error) {
    console.error(error);

    setFetchError(
      "Unable to load tickets. Please try again."
    );

  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchTickets();
}, []);
  
  const filteredTickets = tickets.filter((ticket) => {
  const keyword = search.toLowerCase();

  const matchesSearch =
  String(ticket.id).includes(keyword) ||
  ticket.title.toLowerCase().includes(keyword) ||
  ticket.category.toLowerCase().includes(keyword) ||
  ticket.createdBy?.name
    ?.toLowerCase()
    .includes(keyword) ||
  ticket.createdBy?.email
    ?.toLowerCase()
    .includes(keyword) ||
  ticket.assignedTo?.name
    ?.toLowerCase()
    .includes(keyword);

  const matchesStatus =
    statusFilter === "All Status" ||
    ticket.status === statusFilter;

  const matchesPriority =
  priorityFilter === "All Priority" ||
  ticket.priority === priorityFilter;

const matchesAssignment =
  !isITSupport ||
  assignmentFilter === "All Tickets" ||
  (
    assignmentFilter === "Unassigned" &&
    !ticket.assignedTo &&
    ticket.status !== "Resolved"
  ) ||
  (
    assignmentFilter === "My Tickets" &&
    ticket.assignedTo?.id === currentUser?.id
  );

return (
  matchesSearch &&
  matchesStatus &&
  matchesPriority &&
  matchesAssignment
);
});

const totalPages = Math.ceil(
  filteredTickets.length / ticketsPerPage
);

const indexOfLastTicket =
  currentPage * ticketsPerPage;

const indexOfFirstTicket =
  indexOfLastTicket - ticketsPerPage;

const currentTickets = filteredTickets.slice(
  indexOfFirstTicket,
  indexOfLastTicket
);

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

  {successMessage && (
    <div className="ticket-success-toast">
      <div className="ticket-success-icon">
        ✓
      </div>

      <div>
        <strong>{successMessage}</strong>
        <p>
          Your support request has been added.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setSuccessMessage("")}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  )}

  <header className="dashboard-header">

          <div>
            <p className="dashboard-eyebrow">
              SUPPORT
            </p>

            <h1>Tickets</h1>

            <p>
              View and manage your support requests.
            </p>
          </div>

          {isEmployee && (
  <button
    className="new-ticket-button"
    onClick={() => navigate("/tickets/new")}
  >
    + New Ticket
  </button>
)}

        </header>


        <section className="tickets-card">

          <div className="tickets-card-header">

            <div>
              <h2>All Tickets</h2>
              <p>
                Track and manage all submitted support tickets.
              </p>
            </div>

            <div className="ticket-total">
  {filteredTickets.length} Tickets
</div>

          </div>


          <div className="ticket-toolbar">

            <div className="ticket-search">
              <span>⌕</span>

              <input
  type="text"
  placeholder="Search tickets..."
  value={search}
  onChange={(event) => {
  setSearch(event.target.value);
  setCurrentPage(1);
}}
/>
            </div>


            <select
  className="ticket-filter"
  value={statusFilter}
  onChange={(event) => {
  setStatusFilter(event.target.value);
  setCurrentPage(1);
}}
>
  <option>All Status</option>
  <option>Open</option>
  <option>In Progress</option>
  <option>Resolved</option>
</select>

            <select
  className="ticket-filter"
  value={priorityFilter}
  onChange={(event) => {
  setPriorityFilter(event.target.value);
  setCurrentPage(1);
}}
>
  <option>All Priority</option>
  <option>High</option>
  <option>Medium</option>
  <option>Low</option>
</select>

{isITSupport && (
  <select
    className="ticket-filter"
    value={assignmentFilter}
    onChange={(event) => {
      setAssignmentFilter(event.target.value);
      setCurrentPage(1);
    }}
  >
    <option>All Tickets</option>
    <option>Unassigned</option>
    <option>My Tickets</option>
  </select>
)}

          </div>

{loading && (
  <div className="tickets-loading">
    <div className="tickets-spinner"></div>

    <div>
      <strong>Loading tickets</strong>
      <p>Please wait while we fetch your support requests.</p>
    </div>
  </div>
)}

{fetchError && !loading && (
  <div className="tickets-error-state">

    <div className="tickets-error-icon">
      !
    </div>

    <div>
      <strong>Unable to load tickets</strong>

      <p>
        We couldn't retrieve your tickets.
        Please check your connection and try again.
      </p>

      <button
        type="button"
        onClick={fetchTickets}
        className="tickets-retry-button"
      >
        Try Again
      </button>
    </div>

  </div>
)}

          {!loading && !fetchError && (
          <div className="tickets-table-wrapper">

            <table className="tickets-table">

              <thead>
                <tr>
  <th>TICKET</th>

  {canViewRequester && (
    <>
      <th>REQUESTER</th>
      <th>ASSIGNED TO</th>
    </>
  )}

  <th>CATEGORY</th>
  <th>PRIORITY</th>
  <th>STATUS</th>
  <th>CREATED</th>
  <th></th>
</tr>
              </thead>

              <tbody>

                {currentTickets.map((ticket) => (

                  <tr
  key={ticket.id}
  className="clickable-ticket"
  onClick={() =>
    navigate(`/tickets/${ticket.id}`)
  }
>

                    <td>
                      <div className="table-ticket">

                        <span>
  #HD-{String(ticket.id).padStart(4, "0")}
</span>

                        <strong>
                          {ticket.title}
                        </strong>

                      </div>
                    </td>

                    {canViewRequester && (
  <td>
    <div className="ticket-requester">
      <strong>
        {ticket.createdBy?.name || "Unknown"}
      </strong>

      <span>
        {ticket.createdBy?.email || "-"}
      </span>
    </div>
  </td>
)}

{canViewRequester && (
  <td>
    {ticket.assignedTo ? (
      <div className="ticket-assignee">
        <strong>
          {ticket.assignedTo.name}
        </strong>

        {ticket.assignedTo.id === currentUser?.id && (
          <span>Assigned to you</span>
        )}
      </div>
    ) : (
      <span className="ticket-unassigned">
        Unassigned
      </span>
    )}
  </td>
)}

                    <td>
                      <span className="category-badge">
                        {ticket.category}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`table-priority ${ticket.priority.toLowerCase()}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`table-status ${
                          ticket.status
                            .toLowerCase()
                            .replace(" ", "-")
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td className="table-date">
  {new Date(ticket.createdAt).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )}
</td>

                    <td>
                      <button className="ticket-more">
                        •••
                      </button>
                    </td>

                  </tr>

                ))}

                {filteredTickets.length === 0 && (
  <tr>
    <td colSpan={canViewRequester ? 8 : 6}>
      <div className="no-tickets">

        <div className="no-tickets-icon">
          {tickets.length === 0 ? "◎" : "⌕"}
        </div>

        {tickets.length === 0 ? (
          <>
            <h3>No tickets yet</h3>

            <p>
              {isEmployee
                ? "You haven't submitted any support requests yet."
                : "There are no support tickets available yet."}
            </p>

            {isEmployee && (
              <button
                type="button"
                className="empty-new-ticket-button"
                onClick={() => navigate("/tickets/new")}
              >
                + Create Your First Ticket
              </button>
            )}
          </>
        ) : (
          <>
            <h3>No matching tickets</h3>

            <p>
              Try changing your search or filters.
            </p>
          </>
        )}

      </div>
    </td>
  </tr>
)}

              </tbody>

            </table>

          </div>
          )}


          <div className="tickets-pagination">

            <span>
  {filteredTickets.length === 0
    ? "Showing 0 tickets"
    : `Showing ${indexOfFirstTicket + 1}–${Math.min(
        indexOfLastTicket,
        filteredTickets.length
      )} of ${filteredTickets.length} tickets`}
</span>

            <div className="pagination-buttons">

  <button
    onClick={() =>
      setCurrentPage((page) => page - 1)
    }
    disabled={currentPage === 1}
  >
    ←
  </button>


  {Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).map((page) => (

    <button
      key={page}
      className={
        currentPage === page
          ? "page-active"
          : ""
      }
      onClick={() => setCurrentPage(page)}
    >
      {page}
    </button>

  ))}


  <button
    onClick={() =>
      setCurrentPage((page) => page + 1)
    }
    disabled={
      currentPage === totalPages ||
      totalPages === 0
    }
  >
    →
  </button>

</div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Tickets;

