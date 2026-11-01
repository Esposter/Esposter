export const BROWSER_GLOBAL_MESSAGE =
  "Prefix browser-only globals with `window.` so browser-only code reads as browser-only.";
export const CONTEXT_MESSAGE =
  "`provide`/`inject` hides an input from a component's signature: no caller sees it, a missing provider silently falls back to the default, and a test must mount the provider. Pass a prop, or read a Pinia store for state the app shares. Only a library whose contract is a subtree's context (a theme scope, a renderer's parent) disables this with its reason.";
export const POLLING_MESSAGE =
  "Polling is banned — await the real completion signal (promises, events, flushPromises, waitForSynchronizedFunctions) instead of checking on a timer.";
export const USE_ROUTER_PAGE_MESSAGE =
  "A page reads its route through its own `useRoute()`, which the typed router narrows to the page's params, and navigates with `navigateTo`. See the routing skill.";
export const USE_ROUTE_MESSAGE =
  "Use `useRouter().currentRoute` instead of `useRoute()` — the injected page route freezes when its page is swapped out, so anything outliving that page reads a stale route.";
export const VUETIFY_MESSAGE =
  "Only the UI library imports Vuetify 0 — use a component from `app/components/Ui`, or add the behaviour to the library. See openspec/specs/architecture/ui-library/design.md.";
