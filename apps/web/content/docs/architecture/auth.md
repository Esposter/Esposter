---
title: Auth
description: The better-auth OAuth setup, session middleware, and the authed/rate-limited tRPC procedure chain.
---

# Auth

Authentication is OAuth-only through [better-auth](https://better-auth.com) with the Drizzle adapter — Google, GitHub, and Facebook — mounted at the catch-all `server/api/auth/[...].ts`. Sessions are cookie-based; the Vue client reads them through `authClient.useSession` (better-auth's Vue plugin with the server's inferred additional fields, so `user.biography` is typed end-to-end).

## How it works

```mermaid
flowchart LR
  login[login page<br/>Google / GitHub / Facebook] --> ba[better-auth handler<br/>server/api/auth/...]
  ba --> pg[(users / sessions tables<br/>Drizzle adapter)]
  page[auth-gated page] --> mw[auth middleware<br/>session? else /login]
  client[$trpc call] --> proc[standardAuthedProcedure]
  proc --> isAuthed[getAuthedMiddleware + rate limiter<br/>session → AuthedContext]
  proc --> plugin[achievementPlugin]
```

- **Route gating** — `definePageMeta({ middleware: "auth" })` redirects signed-out visitors to `/login`; the login page itself uses the inverse `guest` middleware. Everything else is public by default.
- **Procedure gating** — `standardAuthedProcedure` = `publicProcedure` + `getAuthedMiddleware(RateLimiterType.Standard)` (session check + rate limiting in one middleware, yielding `AuthedContext` with `getSessionPayload`) + the [achievement plugin](/docs/achievement/unlock-pipeline). `standardRateLimitedProcedure` is the unauthenticated sibling for public reads. Room-scoped RBAC procedures build on top (see [esbabbler RBAC](/docs/esbabbler/rbac)).
- **Users table** — better-auth owns the `users`/`sessions` schema; Esposter adds `biography` via `additionalFields` (`authModelOptions`), validated by the Drizzle-derived Zod schema, with an empty `defaultValue`: better-auth reads the added fields from the provider's profile before a first sign-in creates the user, and a profile carries no biography, so a required field with no default refuses every new account with `MISSING_FIELD`. better-auth's own endpoints share the standard rate-limiter budget.
- **One query per joined read** — `advanced.database.joins` is on, and the adapter comes from `@better-auth/drizzle-adapter/relations-v2` because only that entrypoint resolves a join through our v2 relations. It derives the relation key from the model name, which `authModelOptions` points at the schema export: a join to one row reads the export itself, so `sessionsInAuth` and `accountsInAuth` name their relation to a user `usersInAuth` rather than the singular `user` every other table uses, and a join to many reads the export plus `s`, so `usersInAuth` names its accounts `accountsInAuths`. better-auth joins a session to its user on every session read, and on an OAuth callback an account to its user, then, for an account no row matched, a user to its accounts; rename any of the three and that read throws where drizzle cannot find the relation. `server/services/auth/drizzleAdapterConfiguration.test.ts` runs each join against PGlite.
- **One row per provider account** — `accounts` is unique on `(providerId, accountId)`. better-auth resolves an OAuth sign-in's owner by that pair and throws once two rows match it, which locks that user out until the duplicate is removed by hand. Nothing else enforces it: better-auth declares no such index, and the `issuer` column whose unique once stood in for it went with better-auth 1.7.3.
- **Device identity** — `getDeviceId`/`checkIsSameDevice` fingerprint requests (push-subscription scoping), and `generateToken` mints the shared-secret tokens used by webhook delivery.
- **Session lifetime is the account holder's to end** — every active session is listed and revocable at `/user/settings`, with its push subscriptions and live connections going with it. The session rows are read from our own table because better-auth's `listSessions` is freshness-gated, while the revokes go through better-auth. See [session and device management](/docs/user/session-device-management).

## Key files

Paths relative to `apps/web`.

| File                                                | Role                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------ |
| `server/auth.ts`                                    | better-auth configuration                                                      |
| `server/services/auth/authModelOptions.ts`          | each model's name and the user's added fields, shared with the adapter's tests |
| `server/api/auth/[...].ts`                          | the mounted auth handler                                                       |
| `app/services/auth/authClient.ts`                   | typed Vue session client                                                       |
| `app/middleware/auth.ts`, `app/middleware/guest.ts` | route gating                                                                   |
| `server/trpc/middleware/getAuthedMiddleware.ts`     | session + rate-limit middleware                                                |
| `server/trpc/procedure/standardAuthedProcedure.ts`  | the standard authed chain                                                      |
| `server/services/auth/`                             | device id + webhook token services                                             |

## Notes

- OAuth-only is deliberate — see [users rejected: password auth](/docs/user/rejected/password-auth).
- Anonymous users are first-class where products support it (games persist to localStorage; the feed is readable rate-limited) — auth gates writing and personal state, not browsing.
