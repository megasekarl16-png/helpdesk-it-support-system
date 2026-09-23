import {
  BrowserRouter,
  Routes,
  Route
} from "react-router";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import NewTicket from "./pages/NewTicket";
import EditTicket from "./pages/EditTicket";
import TicketDetail from "./pages/TicketDetail";
import KnowledgeBase from "./pages/KnowledgeBase";

import ProtectedRoute from "./components/ProtectedRoute";

import UserManagement from "./pages/UserManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />

        <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

        <Route
  path="/tickets"
  element={
    <ProtectedRoute>
      <Tickets />
    </ProtectedRoute>
  }
/>

  <Route
  path="/tickets/new"
  element={
    <ProtectedRoute
      allowedRoles={["EMPLOYEE"]}
    >
      <NewTicket />
    </ProtectedRoute>
  }
/>

<Route
  path="/tickets/:id/edit"
  element={
    <ProtectedRoute
      allowedRoles={["EMPLOYEE"]}
    >
      <EditTicket />
    </ProtectedRoute>
  }
/>

<Route
  path="/tickets/:id"
  element={
    <ProtectedRoute>
      <TicketDetail />
    </ProtectedRoute>
  }
/>

<Route
  path="/knowledge-base"
  element={
    <ProtectedRoute>
      <KnowledgeBase />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/users"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <UserManagement />
    </ProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
