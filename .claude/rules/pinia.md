---
paths:
  - "**/store/**/*.ts"
  - "**/stores/**/*.ts"
  - "**/*Store.ts"
---

# Pinia Store Conventions

## Usage in Vue Components

- **Naming**: use the full store name — `const fileTableEditorStore = useFileTableEditorStore()`, not `const store = ...` or abbreviated names.
- **In Vue components**: always destructure, and keep each store's lines grouped together in this order — no mixing across stores:
  1. `const xyzStore = useXyzStore()`
  2. `const { ref1, ref2 } = storeToRefs(xyzStore)` _(omit if no refs/computeds needed)_
  3. `const { method1 } = xyzStore` _(omit if no methods needed)_
  4. _(repeat for next store)_
- Never use dot-access (`store.method()`) in components.
- **Store-to-store** (inside a Pinia store file): declare nested stores at the root of the setup function, access via `store.property` / `store.method()` — do NOT destructure (Pinia requires dot-access for store-to-store to maintain reactivity).

## CRUD Store Patterns

Follow `createOperationData` conventions exactly when writing store update/delete methods:

- **update**: `findIndex` first, guard `if (index === -1) return`, then mutate in place with `Object.assign(takeOne(items.value, index), updatedItem)`.
- **delete**: reassign the array — `items.value = items.value.filter(...)` — never `splice`.
- Always guard against a missing parent ref before any operation: `if (!parentRef.value) return`.
