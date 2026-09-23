import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

import "../styles/dashboard.css";
import "../styles/knowledge-base.css";

const articles = [
  {
    id: 1,
    category: "Network",
    icon: "◎",
    title: "Can't connect to office Wi-Fi",
    description:
      "Steps to troubleshoot common office Wi-Fi connection problems.",
    steps: [
      "Make sure Wi-Fi is enabled on your device.",
      "Disconnect from the office network and connect again.",
      "Restart your Wi-Fi adapter or your device.",
      "Forget the network and reconnect using your credentials.",
      "If the issue continues, create a support ticket.",
    ],
  },
  {
    id: 2,
    category: "Account",
    icon: "♙",
    title: "How to reset your password",
    description:
      "Recover access to your account when you forget your password.",
    steps: [
      "Open the company account sign-in page.",
      "Select the Forgot Password option.",
      "Enter your registered company email address.",
      "Follow the password reset instructions sent to your email.",
      "Contact IT Support if you cannot access your registered email.",
    ],
  },
  {
    id: 3,
    category: "Network",
    icon: "◇",
    title: "VPN connection troubleshooting",
    description:
      "Fix common problems when connecting to the company VPN.",
    steps: [
      "Check that your internet connection is working.",
      "Close and reopen the VPN application.",
      "Verify that your username and password are correct.",
      "Restart your device and try connecting again.",
      "Create a support ticket if the VPN still cannot connect.",
    ],
  },
  {
    id: 4,
    category: "Software",
    icon: "▣",
    title: "Application won't open",
    description:
      "Basic troubleshooting for applications that fail to start.",
    steps: [
      "Close the application completely using Task Manager.",
      "Open the application again.",
      "Restart your computer if the application still does not open.",
      "Check whether another application update is currently running.",
      "Contact IT Support if the problem continues.",
    ],
  },
  {
    id: 5,
    category: "Hardware",
    icon: "▤",
    title: "Printer not detected",
    description:
      "Check common causes when your computer cannot find a printer.",
    steps: [
      "Make sure the printer is powered on.",
      "Check the USB, network, or Wi-Fi connection.",
      "Restart both the printer and your computer.",
      "Check whether the correct printer is selected.",
      "Create a Hardware support ticket if the printer remains unavailable.",
    ],
  },
  {
    id: 6,
    category: "Account",
    icon: "!",
    title: "Account is locked",
    description:
      "What to do when too many failed login attempts lock your account.",
    steps: [
      "Wait a few minutes before trying to sign in again.",
      "Make sure Caps Lock is disabled.",
      "Verify that you are using the correct company account.",
      "Reset your password if necessary.",
      "Contact IT Support if your account remains locked.",
    ],
  },
];

const categories = [
  {
    name: "Network",
    icon: "◎",
    description: "Wi-Fi, VPN and connectivity",
  },
  {
    name: "Software",
    icon: "▣",
    description: "Applications and system errors",
  },
  {
    name: "Account",
    icon: "♙",
    description: "Password and account access",
  },
  {
    name: "Hardware",
    icon: "▤",
    description: "Devices and peripherals",
  },
];

function KnowledgeBase() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [selectedArticle, setSelectedArticle] =
    useState(null);

  const filteredArticles = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === "All" ||
        article.category === selectedCategory;

      const matchesSearch =
        !keyword ||
        article.title.toLowerCase().includes(keyword) ||
        article.description.toLowerCase().includes(keyword) ||
        article.category.toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const handleCategory = (category) => {
    setSelectedCategory(category);
    setSelectedArticle(null);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="knowledge-header">
          <p className="dashboard-eyebrow">
            RESOURCES
          </p>

          <h1>Knowledge Base</h1>

          <p>
            Find quick solutions to common IT issues
            before submitting a support ticket.
          </p>
        </header>

        <div className="knowledge-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search for an issue or solution..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSelectedArticle(null);
            }}
          />
        </div>

        <section className="knowledge-section">
          <div className="knowledge-section-header">
            <div>
              <h2>Browse by Category</h2>
              <p>
                Choose a topic to find relevant
                troubleshooting guides.
              </p>
            </div>

            {selectedCategory !== "All" && (
              <button
                className="clear-category-button"
                onClick={() =>
                  handleCategory("All")
                }
              >
                Show all
              </button>
            )}
          </div>

          <div className="knowledge-category-grid">
            {categories.map((category) => (
              <button
                key={category.name}
                className={`knowledge-category-card ${
                  selectedCategory === category.name
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleCategory(category.name)
                }
              >
                <span className="knowledge-category-icon">
                  {category.icon}
                </span>

                <div>
                  <strong>{category.name}</strong>
                  <p>{category.description}</p>
                </div>

                <span className="knowledge-category-count">
                  {
                    articles.filter(
                      (article) =>
                        article.category ===
                        category.name
                    ).length
                  }
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="knowledge-section">
          <div className="knowledge-section-header">
            <div>
              <h2>
                {selectedCategory === "All"
                  ? "Common Solutions"
                  : `${selectedCategory} Solutions`}
              </h2>

              <p>
                Step-by-step guides for frequently
                reported issues.
              </p>
            </div>

            <span className="knowledge-result-count">
              {filteredArticles.length}{" "}
              {filteredArticles.length === 1
                ? "article"
                : "articles"}
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="knowledge-empty">
              <div>⌕</div>

              <h3>No articles found</h3>

              <p>
                Try another keyword or select a
                different category.
              </p>
            </div>
          ) : (
            <div className="knowledge-article-list">
              {filteredArticles.map((article) => (
                <div
                  className={`knowledge-article ${
                    selectedArticle?.id === article.id
                      ? "open"
                      : ""
                  }`}
                  key={article.id}
                >
                  <button
                    className="knowledge-article-button"
                    onClick={() =>
                      setSelectedArticle(
                        selectedArticle?.id ===
                          article.id
                          ? null
                          : article
                      )
                    }
                  >
                    <span className="article-icon">
                      {article.icon}
                    </span>

                    <div className="article-main">
                      <span className="article-category">
                        {article.category}
                      </span>

                      <strong>{article.title}</strong>

                      <p>{article.description}</p>
                    </div>

                    <span className="article-arrow">
                      {selectedArticle?.id === article.id
                        ? "−"
                        : "+"}
                    </span>
                  </button>

                  {selectedArticle?.id ===
                    article.id && (
                    <div className="article-solution">
                      <div className="solution-heading">
                        <span>✓</span>

                        <div>
                          <strong>
                            Recommended Solution
                          </strong>

                          <p>
                            Follow these steps in
                            order.
                          </p>
                        </div>
                      </div>

                      <ol>
                        {article.steps.map(
                          (step, index) => (
                            <li key={index}>
                              <span>{index + 1}</span>
                              <p>{step}</p>
                            </li>
                          )
                        )}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default KnowledgeBase;
