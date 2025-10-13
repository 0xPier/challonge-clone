# Active Context

## Current Work Focus

The immediate focus is to fix the broken responsive layout of the application. The `Navbar` and `Sidebar` components are not interacting correctly, causing visual bugs on both mobile and desktop views.

## Recent Changes

- Refactored the routing in `App.tsx` to use a shared `Layout` component for most pages.
- Attempted to fix the responsive layout by moving the `Sidebar` component inside the `Navbar` for mobile views. This was unsuccessful.

## Next Steps

1.  Revert the incorrect change of rendering the `Sidebar` inside the `Navbar`.
2.  Restore the `Sidebar` to `Layout.tsx`.
3.  Implement a proper responsive sidebar pattern using Tailwind CSS classes to create a mobile overlay that does not interfere with the main content.

## Active Decisions and Considerations

- The `isMenuOpen` state, which controls the visibility of the mobile menu, should be managed in the `Layout.tsx` component and passed down to the `Navbar` and `Sidebar` components.
- The `Sidebar` should be a persistent element on desktop screens and a toggleable overlay on mobile screens.
