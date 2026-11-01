import type { RestrictedGlobal } from "./RestrictedGlobal.ts";

import { BROWSER_GLOBAL_MESSAGE, CONTEXT_MESSAGE, POLLING_MESSAGE, USE_ROUTE_MESSAGE } from "./messages.ts";

// An override replaces a rule's options wholesale, so each scope's list is the root's entries with its own lifted or
// Added by identity, and a ban added here reaches every scope that does not lift it
export const BROWSER_GLOBALS: RestrictedGlobal[] = [
  "document",
  "history",
  "localStorage",
  "location",
  "matchMedia",
  "navigator",
  "screen",
  "sessionStorage",
].map((name) => ({ message: BROWSER_GLOBAL_MESSAGE, name }));
export const USE_ROUTE_GLOBAL: RestrictedGlobal = { message: USE_ROUTE_MESSAGE, name: "useRoute" };
export const USE_UI_STYLE_GLOBAL: RestrictedGlobal = {
  message:
    "Only the UI library reads the design style: a feature that differs by style asks the library to draw it. See openspec/specs/architecture/design-language/design.md#design-styles.",
  name: "useUiStyle",
};
export const FETCH_GLOBAL: RestrictedGlobal = {
  message:
    "A script's request goes through `fetchOk` (`scripts/src/services/shared/fetchOk.ts`), which refuses a non-2xx answer, `fetchJson` for a JSON body, or `fetchResponse` (`scripts/src/services/shared/fetchResponse.ts`) for a caller that reads a status as an answer; each bounds the request with a timeout, and a bare `fetch` does neither.",
  name: "fetch",
};
export const RESTRICTED_GLOBALS: RestrictedGlobal[] = [
  ...BROWSER_GLOBALS,
  { message: CONTEXT_MESSAGE, name: "inject" },
  { message: CONTEXT_MESSAGE, name: "provide" },
  USE_ROUTE_GLOBAL,
  { message: POLLING_MESSAGE, name: "waitFor" },
  { message: POLLING_MESSAGE, name: "waitUntil" },
  USE_UI_STYLE_GLOBAL,
];
