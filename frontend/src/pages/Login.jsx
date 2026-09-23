import { useState } from "react";
import { useNavigate } from "react-router";
import "../App.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

const loginWithCredentials = async (
  loginEmail,
  loginPassword
) => {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      "http://localhost:8080/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Login failed."
      );
    }

    localStorage.setItem(
      "token",
      data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      })
    );

    navigate("/dashboard");
  } catch (error) {
    console.error("Login error:", error);

    setError(
      error.message ||
      "Unable to login. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  const handleLogin = async (event) => {
  event.preventDefault();

  if (!email.trim() || !password) {
    setError(
      "Please enter your email and password."
    );
    return;
  }

  await loginWithCredentials(
    email.trim(),
    password
  );
};

const handleDemoLogin = async (role) => {
  const demoAccounts = {
    EMPLOYEE: {
      email: "employee.demo@helpdesk.com",
      password: "HelpDeskDemo123!",
    },

    IT_SUPPORT: {
      email: "support.demo@helpdesk.com",
      password: "HelpDeskDemo123!",
    },

    ADMIN: {
      email: "admin.demo@helpdesk.com",
      password: "HelpDeskDemo123!",
    },
  };

  const account = demoAccounts[role];

  if (!account) {
    return;
  }

  setEmail(account.email);
  setPassword(account.password);

  await loginWithCredentials(
    account.email,
    account.password
  );
};

  return (
    <div className="login-page">

      <div className="login-brand">
        <div className="brand-logo">H</div>

        <div>
          <h2>HelpDesk</h2>
          <span>IT Support</span>
        </div>
      </div>

      <div className="login-container">

        <div className="login-info">
          <span className="login-badge">
            IT SUPPORT SYSTEM
          </span>

          <h1>
            Support made
            <br />
            simple.
          </h1>

          <p>
            Report technical issues, track support
            requests, and get help from your IT team
            in one place.
          </p>

          <div className="login-features">

            <div className="feature-item">
              <span>✓</span>
              Create and track support tickets
            </div>

            <div className="feature-item">
              <span>✓</span>
              Communicate with IT support
            </div>

            <div className="feature-item">
              <span>✓</span>
              Monitor ticket progress
            </div>

          </div>
        </div>

        <div className="login-card">

          <div className="login-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your HelpDesk account.</p>
          </div>

          <div className="demo-login">

  <div className="demo-login-header">
    <span>PORTFOLIO DEMO</span>

    <p>
      Explore the system using a demo role.
    </p>
  </div>

  <div className="demo-role-buttons">

    <button
      type="button"
      disabled={loading}
      onClick={() =>
        handleDemoLogin("EMPLOYEE")
      }
    >
      <strong>Employee</strong>
      <small>Create & track tickets</small>
    </button>

    <button
      type="button"
      disabled={loading}
      onClick={() =>
        handleDemoLogin("IT_SUPPORT")
      }
    >
      <strong>IT Support</strong>
      <small>Handle support requests</small>
    </button>

    <button
      type="button"
      disabled={loading}
      onClick={() =>
        handleDemoLogin("ADMIN")
      }
    >
      <strong>Admin</strong>
      <small>Manage system access</small>
    </button>

  </div>

</div>

<div className="login-divider">
  <span>or sign in manually</span>
</div>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label>Email address</label>

              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">

              <div className="password-label">
  <label>Password</label>
</div>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <span>→</span>
                </>
              )}
            </button>

          </form>

        </div>
      </div>

      <p className="copyright">
        © 2026 HelpDesk. IT Support Management System.
      </p>

    </div>
  );
}

export default Login;
