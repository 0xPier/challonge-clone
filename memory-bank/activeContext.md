# Active Context

## Current Work Focus

Stabilize the admin workflow and deployment story. We just hardened bracket generation and introduced dedicated development and production Docker stacks; the immediate goal is to validate those flows end-to-end and prep for deployment.

## Recent Changes

- Normalized bracket creation to prevent invalid matches during admin approvals or early starts.
- Added multi-stage Dockerfiles for backend/frontend plus separate dev/prod compose files.
- Updated docs with container usage instructions and build overrides.

## Next Steps

1. Run the admin test script (`node src/scripts/testAdminEndpoints.js`) and/or manual QA against the Docker stack once Mongo is available.
2. Replace placeholder secrets in `docker-compose.yml` and consider enabling Mongo auth for production.
3. Confirm the responsive layout still behaves as expected after container refactor; capture any regressions.

## Active Decisions and Considerations

- Keep dev and prod compose files in sync when API URLs or ports change.
- Prioritize test coverage (especially around bracket generation) before calling the admin flow “done.”
- Security hardening (secrets, DB auth, backups) is required before any public deployment.
