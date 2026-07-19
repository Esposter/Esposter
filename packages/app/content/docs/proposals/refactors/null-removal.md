---
title: Null Removal
description: Eliminate null from all app-owned TypeScript/Vue code in favour of undefined, enforced by ESLint, with carve-outs at the Drizzle and Azure boundaries.
---

# Null Removal

Eliminate `null` from all TypeScript / Vue source in favour of `undefined`, enforced by an ESLint rule. The only accepted carve-outs are the Drizzle ORM / Azure boundary layers, where the external systems own the type.

## Why

- One absent-value sentinel everywhere. `undefined` is already the implicit value for missing object keys, optional parameters, and uninitialised refs; `null` adds no meaning and forces every consumer to handle two sentinels.
- `undefined` composes cleanly with optional chaining (`?.`) and optional properties (`field?:`); `null` does not.
- Removes the entire `=== null` vs `=== undefined` bug class.

## Scope

Phase 1 has shipped the ESLint gate (at warn) and the `nullToUndefined` helper — see the Progress section below. At the last audit, `null` appeared as roughly 70 union-type annotations in Vue refs/composables, 117 literal assignments/returns, `.nullable()` Zod fields across six files (`ColumnStatistics.ts`, `HandleBounds.ts`, `TodoListItem.ts`, `UpsertRoomFilterInput.ts`, `AItemEntity.ts`, `ProgramResource.ts` — not three, as an earlier draft claimed), plus `ColumnValue.ts` using `z.null()` in a union, ~6 Azure external-API type members, 26 Drizzle schema files with nullable columns, and ~50 test-fixture values (`deletedAt: null`, `image: null`).

## Carve-outs (keep `null`)

Two areas are owned by external systems; changing them would require a DB migration or fight Azure SDK types. Keep `null` there and convert at the boundary before values enter app code.

1. **Drizzle ORM schema inferences** — nullable columns (`text()` without `.notNull()`) infer as `string | null`. Convert to `undefined` via a thin `nullToUndefined` transform in the select helpers.
2. **Azure Table / EventGrid API types** — `SerializableValue`, `FriendRequestNotificationEventGridData.icon / title`. Keep the raw Azure types as-is; convert on ingress.

Carve-out paths: `packages/db-schema/src/schema/`, `packages/db-schema/src/models/azure/`, and any file that directly re-exports Drizzle column inference.

## Phases

### Phase 1 — ESLint rule (gate)

Add a `no-restricted-syntax` rule in `packages/configuration` erroring on `TSNullKeyword` (null as a type union member) and `null` literals outside carve-out paths. Enable as a **warning** first so existing violations are visible without blocking CI; flip to **error** in phase 7.

### Phase 2 — Boundary helpers

Add `nullToUndefined` in `packages/shared` (`value === null ? undefined : value`) plus a mapped-type helper that recursively converts `T | null` → `T | undefined` for Drizzle select results, applied at the query layer rather than field-by-field. These helpers are the only place `null` may appear in app-owned code going forward.

### Phase 3 — Zod schemas

Six app-owned files use `.nullable()`. Phase 1 audited each and found they are all boundaries rather than sentinel-null, so none were mechanically converted — each needs its own strategy (see Progress → "Six `.nullable()` files"):

| File                                                      | Fields                                                        | Disposition                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| `shared/models/resource/sheet/column/ColumnStatistics.ts` | `average`, `falseCount`, `trueCount`, `minimum`, `maximum`, … | Kept — entangled with the sheet null-strategy domain carve-out    |
| `shared/models/flowchartEditor/data/HandleBounds.ts`      | `source`, `target`                                            | Kept — satisfies the external `@vue-flow/core` `NodeHandleBounds` |
| `shared/models/resource/todoList/TodoListItem.ts`         | `dueAt`                                                       | Kept — persisted blob already stores JSON `null`                  |
| `shared/models/db/room/UpsertRoomFilterInput.ts`          | `timeoutDurationMs`                                           | Kept — tRPC input → nullable DB column; consumers in locked UI    |
| `shared/models/entity/AItemEntity.ts`                     | `deletedAt`                                                   | Kept — nullable timestamp, mirrors the `ItemMetadata` mixin       |
| `shared/models/resource/program/ProgramResource.ts`       | `audience`                                                    | Kept — persisted blob already stores JSON `null` via `.default`   |

`ColumnValue.ts` uses `z.null()` in a union — but this is the sheet empty-cell value (the null-strategy domain carve-out), so it stays. `SerializableValue` in `packages/db-schema/src/models/azure/` stays as-is (carve-out).

Converting the persisted-blob schemas (`TodoListItem`, `ProgramResource`) requires a read-tolerance step (accept stored `null`, emit `undefined`) or an accepted reset-on-parse-fail migration — a behaviour change, so deferred out of the types-only phase-1 PR.

### Phase 4 — Vue components & composables

Mechanical replacements: `ref<T | null>(null)` → `ref<T | undefined>()` (undefined is the default), `defineModel<T | null>` → `defineModel<T | undefined>`, `computed<T | null>` → `computed<T | undefined>`. Vuetify's date pickers accept `undefined` for no-selection — `null` is not required (confirm against the Vuetify 4 API on the date-picker components).

### Phase 5 — Literal assignments & returns

After phases 3–4 change the types, most literal sites surface as type errors. Remaining patterns: `foo.value = null` → `= undefined`, `return null` → `return undefined`, drop `?? null` entirely, `!== null` / `=== null` guards → `undefined` checks or `??`.

### Phase 6 — Test fixtures

Update mock row data (`deletedAt: null` → `deletedAt: undefined`, etc.). Fixtures that mimic raw DB rows should use the post-conversion shape, matching the phase-2 boundary.

### Phase 7 — Flip ESLint rule to error

Once all violations outside the carve-out paths are resolved, change the rule from warn to error and name the carve-outs in a comment in the ESLint config.

## Progress

### Phase 1 (shipped)

**ESLint gate (warn).** A custom `esposter/no-null` rule (`packages/configuration/eslint/rules/noNull.js`, wired via `eslint/plugins/esposter.js`) flags both `TSNullKeyword` (the `| null` type position) and `null` literals at **warn**. It is a dedicated rule rather than a `no-restricted-syntax` entry because the existing `no-restricted-syntax` runs at `error`, and one ESLint rule cannot carry two severities on the same files — `unicorn/no-null` is not installed and only covers literals anyway. Phase 7 flips this rule to `error` and adds `ignores` for the carve-out paths.

**Boundary helper.** `nullToUndefined` + the recursive `NullToUndefined<T>` type live in `@esposter/shared` (`util/object/` and `util/types/`). The function recurses through plain objects and arrays so a whole Drizzle select row converts at the query layer; Dates and class instances pass through untouched. First applied at the Drizzle/better-auth ingress in `server/services/message/call/createParticipant.ts`.

**Sweep (types/idioms only, zero behaviour change).** Converted sentinel `null` → `undefined` in: `useDocumentPictureInPicture`, `usePushToTalk`, the `dungeons/settings/volume` store, `useSurveyResponse`, and `getSurroundingPages` (+ `Docs/Surround.vue` + its test).

### Six `.nullable()` files

All six were audited and **kept** with per-file reasons (see the Phase 3 table). The headline "mechanical `.nullable()` → `.optional()`" does not hold: each is an external-library type, a nullable DB timestamp, a tRPC input mapping to a nullable column, or a persisted blob that already stores JSON `null`.

### Remaining

Most remaining `null` in the codebase is **legitimate** and out of scope: DB timestamps (`deletedAt`/`expiresAt`), genuine JS `typeof`-object guards, external boundaries (DOM/`querySelector`, Vuetify, Vue Router, better-auth, Tiptap, three.js, Storage), `JSON.stringify(x, null, 2)` replacers, and the sheet null-strategy domain carve-out. Sentinel `null` still to convert (deferred to later phases / owned by parallel work): ~20 `T | null` type annotations and ~30 literals/guards across `app/app` (message-area components, poll voting, link-preview), plus the locked paths. The `packages/shared`, `app/shared`, and `app/server` layers are largely boundary/timestamp-only and had few sentinel sites.

## Checklist

- [x] Phase 1 — ESLint `null` gate at warn (`esposter/no-null`, both type + literal)
- [x] Phase 2 — `nullToUndefined` + `NullToUndefined<T>` in `@esposter/shared`; first boundary application
- [ ] Phase 3 — Zod schemas: all six audited and documented-kept (need per-file strategies, see above)
- [ ] Phase 4 — Vue refs / models / computed: `T | null` → `T | undefined` (started)
- [ ] Phase 5 — Literal assignments, returns, guards (started)
- [ ] Phase 6 — Test fixtures
- [ ] Phase 7 — Flip ESLint rule to error; verify CI is green
