# Train Prediction

A monorepo-based train prediction system built with **Turborepo** and **pnpm**.

The project is organized into independent applications and shared packages, making it easier for multiple developers to work on the frontend, backend, and machine-learning components simultaneously.

---

## Tech Stack

### Monorepo

- [Turborepo](https://turbo.build/repo)
- [pnpm](https://pnpm.io/)

### Applications

| Application   | Technology       | Purpose                     |
| ------------- | ---------------- | --------------------------- |
| `api-gateway` | Node.js          | Main backend/API gateway    |
| `frontend`    | React + Vite     | User-facing web application |
| `ml-service`  | FastAPI + Python | Machine-learning service    |

### Shared Packages

| Package      | Purpose                                                       |
| ------------ | ------------------------------------------------------------- |
| `validation` | Shared data-validation logic for the frontend and API gateway |

---

## Project Structure

```text
train_prediction/
│
├── apps/
│   │
│   ├── api-gateway/
│   │   ├── src/
│   │   │   └── app.js
│   │   ├── .env.sample
│   │   └── package.json
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── index.css
│   │   │   └── main.jsx
│   │   ├── .env.example
│   │   ├── eslint.config.js
│   │   ├── index.html
│   │   ├── jsconfig.json
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   └── vite.config.js
│   │
│   └── ml-service/
│       ├── app/
│       │   └── main.py
│       ├── .env.sample
│       ├── package.json
│       └── requirements.txt
│
├── packages/
│   └── validation/
│       └── package.json
│
├── .gitignore
├── .npmrc
├── .prettierignore
├── .prettierrc
├── LICENSE.txt
├── README.md
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Architecture

The project follows a service-oriented structure:

```text
    ┌─────────────────┐
    │    Frontend     │
    │ React + Vite    │
    └────────┬────────┘
              │
              ▼
    ┌─────────────────┐
    │   API Gateway   │
    │     Node.js     │
    └────────┬────────┘
              │
              ▼
    ┌─────────────────┐
    │   ML Service    │
    │ FastAPI/Python  │
    └─────────────────┘
```

### Frontend

The `frontend` application provides the user interface and communicates with the API Gateway.

### API Gateway

The `api-gateway` application acts as the main backend and entry point for frontend requests.

It is responsible for handling application-level API operations and communicating with other services such as the ML service.

### ML Service

The `ml-service` application provides the machine-learning functionality through a FastAPI backend.

It is maintained separately from the Node.js API so that the ML components can use the Python ecosystem.

### Validation Package

The `validation` package contains validation logic that can be shared between applications, particularly between the frontend and API Gateway.

---

## Prerequisites

Make sure the following are installed:

- Node.js
- pnpm
- Python
- Git

Verify the installations:

```bash
node --version
pnpm --version
python --version
git --version
```

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Move into the project directory:

```bash
cd train_prediction
```

Install the JavaScript workspace dependencies:

```bash
pnpm install
```

---

## Python ML Service Setup

The ML service uses a Python virtual environment.

Navigate to the ML service:

```bash
cd apps/ml-service
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

Return to the repository root:

```bash
cd ../..
```

> The `.venv` directory should not be committed to the repository.

---

## Environment Variables

Each application can have its own environment configuration.

### API Gateway

Create:

```text
apps/api-gateway/.env
```

using:

```text
apps/api-gateway/.env.sample
```

as the reference.

### Frontend

Create:

```text
apps/frontend/.env
```

using:

```text
apps/frontend/.env.example
```

as the reference.

### ML Service

Create:

```text
apps/ml-service/.env
```

using:

```text
apps/ml-service/.env.sample
```

as the reference.

> Never commit files containing actual secrets or sensitive environment values.

---

## Development

The repository uses Turborepo to manage tasks across the monorepo.

Run development tasks from the repository root:

```bash
pnpm dev
```

Build the workspace:

```bash
pnpm build
```

Run linting:

```bash
pnpm lint
```

Run formatting:

```bash
pnpm format
```

> Available scripts may change as the project develops.

---

## Monorepo Commands

Run a command across the workspace:

```bash
pnpm <command>
```

Run a command for a specific application:

```bash
pnpm --filter frontend <command>
```

```bash
pnpm --filter api-gateway <command>
```

For example:

```bash
pnpm --filter frontend dev
```

---

## Code Formatting

The repository uses a root-level Prettier configuration so that contributors follow a consistent formatting style.

Formatting configuration:

```text
.prettierrc
.prettierignore
```

Format the project:

```bash
pnpm format
```

Check formatting without modifying files:

```bash
pnpm format:check
```

---

## Development Workflow

The project is designed for collaborative development.

A typical workflow is:

```text
main
  │
  └── develop
       │
       ├── feature/frontend
       ├── feature/api
       ├── feature/ml
       └── feature/...
```

Developers should work on feature branches rather than directly modifying the shared `main` branch.

Example:

```bash
git switch develop
git pull origin develop

git switch -c feature/frontend
```

After completing the work:

```bash
git add .
git commit -m "Add frontend feature"
git push origin feature/frontend
```

The feature branch can then be submitted as a Pull Request for review.

---

## Applications

### `apps/api-gateway`

Node.js backend responsible for:

- API endpoints
- Application business logic
- Communication with the ML service
- Frontend-facing API operations

Main entry point:

```text
apps/api-gateway/src/app.js
```

---

### `apps/frontend`

React frontend built with Vite.

Main source files:

```text
apps/frontend/src/
├── App.jsx
├── index.css
└── main.jsx
```

The frontend currently uses Tailwind CSS.

---

### `apps/ml-service`

Python-based machine-learning service using FastAPI.

Main application:

```text
apps/ml-service/app/main.py
```

Python dependencies:

```text
apps/ml-service/requirements.txt
```

The service uses a local Python virtual environment during development.

---

## Shared Packages

### `packages/validation`

Shared validation package intended to provide consistent validation between the frontend and API Gateway.

This package can be expanded as the application's data models and validation requirements are defined.

---

## Future Infrastructure

The project is expected to evolve to include additional development and deployment infrastructure.

Potential additions include:

- Docker
- Docker Compose
- Postman API collections
- API documentation
- CI/CD
- Turborepo Remote Caching
- Additional shared packages
- Database services

These components will be documented here as they are added to the project.

---

## Team Development

This project is intended to be developed collaboratively by a small development team.

Recommended responsibilities can be separated around the major applications:

```text
Frontend Developer
        │
        ▼
apps/frontend

Backend Developer
        │
        ▼
apps/api-gateway

ML Developer
        │
        ▼
apps/ml-service
```

Changes should be reviewed through Pull Requests before being merged into the shared branches.

---

# License

Shield: [![CC BY-NC 4.0][cc-by-nc-shield]][cc-by-nc]

This work is licensed under a
[Creative Commons Attribution-NonCommercial 4.0 International License][cc-by-nc].

[![CC BY-NC 4.0][cc-by-nc-image]][cc-by-nc]

[cc-by-nc]: https://creativecommons.org/licenses/by-nc/4.0/
[cc-by-nc-image]: https://licensebuttons.net/l/by-nc/4.0/88x31.png
[cc-by-nc-shield]: https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg
