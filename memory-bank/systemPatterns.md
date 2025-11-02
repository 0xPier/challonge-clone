# System Patterns

## System Architecture

The application is a single-page application (SPA) built with React. It follows a component-based architecture, with a clear separation of concerns between UI components, services, and state management.

- **Frontend:** React + TypeScript, served by a CRA dev server in development and by nginx in production (built via multi-stage Dockerfile).
- **Backend:** Node.js/Express REST API backed by MongoDB, shipped via a slim runtime Docker image.
- **Infrastructure:** Docker Compose orchestrates MongoDB, backend, and frontend with separate files for dev (`docker-compose.dev.yml`) and prod (`docker-compose.yml`).

## Key Technical Decisions

- **Component-Based Architecture:** The UI is broken down into reusable components, which makes the codebase easier to maintain and scale.
- **State Management:** Redux Toolkit is used for global state management, providing a single source of truth for the application's data.
- **Styling:** Tailwind CSS is used for styling, allowing for rapid UI development with a consistent design language.

## Design Patterns in Use

- **Container/Presentational Components:** This pattern is used to separate the logic of a component from its presentation.
- **Hooks:** React Hooks are used to manage component state and side effects.
- **Responsive Design:** The application is designed to be responsive, with a mobile-first approach.
- **Multi-stage Docker Builds:** Separate build/runtime stages minimize production images and expose optional dev targets.
