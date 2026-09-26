# Unwrapping Reactive Proxies

Read when reactive data is handed to an API that needs a plain object — IndexedDB, `structuredClone`, `postMessage`.

- Always `toRawDeep` from `@esposter/shared`, never Vue's `toRaw` — `toRaw` only unwraps one level. Critical when passing reactive data to APIs requiring plain objects (IndexedDB `store.put()`, `structuredClone`, `postMessage`).
- **Only clone what came out of reactive state.** `structuredClone(toRawDeep(...))` is for data pulled from stores/refs; a freshly constructed class instance is already plain and non-reactive — pass it straight through (`push(new CreateFooCommand(...))`).
