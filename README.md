# Ledger 📒

### Transparent Contribution Pipelines for NGOs & Open Source

> **Problem:** NGOs and open-source contributors often duplicate work due to poor visibility of ongoing efforts.
> **Solution:** **Ledger** is a collaborative platform designed to make contribution pipelines transparent, reusable, and efficient. It acts as a central registry to track, visualize, and share development efforts across organizations.

---

## 🧐 About the Project

**Ledger** solves the "reinventing the wheel" problem in the social impact sector. Instead of just listing issues, Ledger tracks the lifecycle of software modules.

If an NGO needs an "Inventory System," Ledger allows them to search if a "Stock Database" module already exists or is currently being built by another organization. This promotes collaboration over duplication.

## 🚀 Key Features

* **Pipeline Visualization:** Kanban-style tracking of project lifecycles.
* **Duplication Alerts:** automated warnings if a similar project is already in development.
* **Module Registry:** A library of reusable code blocks (e.g., Auth, Payments).
* **Environment-Aware Deployment:** Secure, distinct builds for Staging and Production.

---

## 🛠 Tech Stack

* **Frontend:** React.js (Vite/Next.js)
* **Backend:** Node.js / Express
* **Database:** MongoDB
* **CI/CD:** GitHub Actions
* **Hosting:** AWS / Vercel

---

## ⚙️ Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/kalviumcommunity/S72_0126_Catalyst_MERN_Ledger.git
cd S72_0126_Catalyst_MERN_Ledger

```


2. **Install dependencies**
```bash
npm install

```


3. **Run Locally**
```bash
npm run dev

```



---

## 🔐 DevOps: Environment & Secrets (Concept-2 Implementation)

This project implements **Multi-Environment Architectures** to ensure safe and reliable deployments. We have separated configurations for **Development**, **Staging**, and **Production**.

### 1. Multi-Environment Configuration

We use distinct `.env` files to manage variables. This prevents "it works on my machine" errors and ensures test data never mixes with production data.

* **Files Created:**
* `.env.development` (Localhost)
* `.env.staging` (Cloud testing environment)
* `.env.production` (Live environment)


* **Example Configuration (`.env.example`):**
*Note: Real secrets are strictly git-ignored.*
```properties
# .env.example
VITE_API_URL=http://localhost:5000/api
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/dev_db
JWT_SECRET=dev_secret_placeholder

```



### 2. Secure Secret Management

We ensure no sensitive data is hardcoded or committed to GitHub:

* **GitHub Secrets:** All API keys, Database URIs, and Tokens are stored in the repository settings under `Settings > Secrets and variables > Actions`.
* **Injection:** During the CI/CD pipeline, these secrets are injected dynamically into the build process.

### 3. Build Verification

We have configured our `package.json` to support environment-specific builds using `env-cmd` (or similar tools):

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "build:staging": "env-cmd -f .env.staging react-scripts build",
  "build:production": "env-cmd -f .env.production react-scripts build"
}

```

### 4. Reflection on Reliability

> **Why this matters:**
> By isolating environments, we can deploy to **Staging** and break things safely without affecting real users. Managing secrets via **GitHub Secrets** rather than hardcoding them ensures that even if our code is public (Open Source), our database and administrative access remain secure. This mimics a professional DevOps workflow.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

---

*Project maintained by the Ledger Team*