# Technical Decisions

## Framework Choice
**Angular 17+** - Chosen for its comprehensive ecosystem, TypeScript support, and enterprise-grade architecture.

## Key Libraries
- **Leaflet.js** - Lightweight mapping solution, easier setup than Mapbox
- **json-server** - Quick mock API setup, file-based persistence
- **RxJS** - Built into Angular, handles async operations effectively
- **SCSS** - Modular styling with variables and mixins

## Architecture Decisions

### Component Structure
- **Standalone Components** - Modern Angular approach, reduces boilerplate
- **Feature-based organization** - Groups related components together
- **Reactive Forms** - Better validation and type safety than template forms

### Styling Approach
- **SCSS Modularity** - Shared variables, mixins, utilities for consistency
- **Component-scoped styles** - Prevents style conflicts
- **Responsive design** - Mobile-first approach with breakpoint mixins
