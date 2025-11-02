# Progress

## What Works

- User auth (register/login), profile basics, and Redux-driven layout.
- Tournament creation, approval, and start flows, including the sanitized bracket generation logic.
- Admin dashboard actions (approve/reject/start/add/remove/delete) via the REST API.
- Dockerized development and production stacks with documented usage.

## What's Left to Build / Verify

- Full regression pass of admin endpoints (script + manual) inside the Docker stack.
- Responsive layout QA across breakpoints to ensure Navbar/Sidebar still behave.
- Production hardening: real secrets, Mongo auth/backups, logging/monitoring.
- Optional enhancements (real-time Socket.IO, OAuth) remain out of scope for now.

## Current Status

Feature work is largely complete; focus has shifted to validation and deployment readiness. Docker assets and docs are in place, but no tests have been executed in this environment yet.

## Known Issues / Risks

- Admin flow changes rely on new bracket logic—needs automated coverage.
- Placeholder JWT secret and open Mongo instance in compose files are unsafe for real deployments.
- Responsive regressions are possible and should be checked before launch.

## Evolution of Project Decisions

- Moved from ad-hoc local setup to dual Docker workflows (dev vs prod) for consistency.
- Hardened bracket generation after identifying admin start errors caused by invalid participant payloads.
- Deployment readiness now shares priority with UI polish.
