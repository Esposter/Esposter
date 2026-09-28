# The OWASP Top 10, read against Esposter

Read when reviewing a change or a sweep unit for security. There is one section per OWASP Top 10:2025 category, in OWASP's order. Each gives the questions a window's files are asked and the owner whose rule answers them. A category the window cannot reach is answered "nothing" and named. When a question has no owner here, that is the gap `SKILL.md`'s last rule turns into a new row. The category pages themselves are in `references/sources.md`.

## A01 Broken Access Control

- Does every procedure start from a builder that says who may call it: `standardAuthedProcedure`, a room builder, or `standardRateLimitedProcedure` for a read that is public on purpose (the `trpc` skill, `references/room-procedures.md`)?
- Does a read or write by an id from input scope its `where` to the caller, the room or the owned resource, so a guessed id returns nothing (the `trpc` skill, `references/ownership-guards.md`)? This is OWASP's insecure direct object reference.
- Does a room action check the permission bit, not just membership (`apps/web/content/docs/esbabbler/rbac.md`)?
- Does an asset url grant only the blob it names, for minutes, and does an anonymous read reach only published content (`apps/web/content/docs/resource/resource-file-assets.md`, `apps/web/content/docs/architecture/file-uploads.md`)?
- Does a row describing another user carry only `PublicUser`'s columns, never the account holder's email or storage account (the `drizzle` skill, `references/queries.md`)? A `with:` relation to `users` or a `getColumns(users)` select is where a whole row slips through.
- Does a server route outside tRPC (`apps/web/server/api/**`, `apps/web/server/routes/**`) do its own session and ownership check, since no builder does it there?
- Is an action against another member enforced in server state — a row, the SFU — rather than by the targeted client obeying an event? A removal from a room reaches its calls too, and a token that outlives the membership is refused where it reconnects (`apps/web/content/docs/architecture/security/server-authority.md`).
- Does a read through an id held in content — a dataset, a survey, an asset url — scope itself to the content owner, answering an unowned id as if it were missing (`apps/web/content/docs/architecture/security/cross-owner-references.md`)?
- Does a client-chosen discriminator exclude the values only the server writes — a member posting only `userMessageTypeSchema`'s types, never a line in the room's voice?

## A02 Security Misconfiguration

- Does a new third-party origin, worker or browser capability have its CSP or permissions-policy entry, with the dependency behind it named (`apps/web/content/docs/architecture/security-posture.md`)?
- Does a new body-carrying route respect the request size limits (`apps/web/content/docs/architecture/file-uploads.md`)?
- Does a new Azure resource follow the estate's posture, or name the constraint it is gated on (`apps/web/content/docs/infra/cost-and-security-posture.md`, `apps/infra/docs/azure/security-constraints.md`)?
- Does an error reaching the client carry a message meant for it, and never a stack or an internal identifier (the `error-handling` skill, `references/error-classes.md`)?

## A03 Software Supply Chain Failures

- Did a new dependency go through admission, not just `pnpm add` (`apps/web/content/docs/architecture/dependency-admission.md`)?
- Does a package that runs install scripts appear in `allowBuilds` in `pnpm-workspace.yaml` on purpose?
- Is a new or bumped action pinned to a commit SHA (the `github-actions` skill, and the `dependency-updates` skill, `references/github-actions.md`)?
- Does a workflow triggered by an outside contributor run with only the permissions and secrets it needs (the `github-actions` skill)?

## A04 Cryptographic Failures

- Is a secret or bearer token (a webhook token, a share id) made from a cryptographic source, never `Math.random`, and is it compared as a whole value?
- Does a credential reach the code through the secret store, never a literal or a committed env file (the `pulumi-infra` skill, and `apps/web/content/docs/proposals/infra/keyless-auth-hardening.md` for where it is heading)?
- Is a signed url short-lived and scoped to one blob (`apps/web/content/docs/architecture/file-uploads.md`)?

## A05 Injection

- **HTML**: is every `v-html` fed only by a sanitizer's output, with the disable comment naming that source, and is rich text sanitized at the Zod boundary (the `string-utils` skill, `references/html-sanitization.md`)? Text the server writes itself — a system line with a member's name in it — never passed that boundary, so a surface rendering several message types as markup renders only the sanitized ones that way.
- **SQL**: is every query built with Drizzle's builder or the `sql` tag's interpolation, which parameterizes, and is `sql.raw` fed only by constants (the `drizzle` skill)?
- **Azure Table filters**: are they built by `serializeClauses`, never by string concatenation (the `azure-table` skill)?
- **Spreadsheets**: does exported CSV neutralize a cell starting with a formula character (`apps/web/content/docs/proposals/resource/dataset-csv-export.md`)?
- **Shell**: does a script run a process with an argument array, never a command string built from input?
- **URL scheme handlers**: does a program a link can start (`esposter-host://`) accept the link as its one argument and refuse any launch carrying more, since any site can open a link and a quote in it smuggles in flags (`checkIsSchemeLaunchTampered`, [host installer](/docs/infra/claude-interface/agent-console/host-installer))?
- **Workflows**: does template data reach the shell only through `env:` (the `github-actions` skill, `references/template-data.md`)?
- **Models**: does untrusted text reaching a model that holds tools stay data the model reads, not instructions it follows (the agent console, `packages/agent-console-server`)?

## A06 Insecure Design

- Is an anonymous caller keyed on the address the front end appended (`getIpAddress`, the rightmost `X-Forwarded-For` entry), never one the caller sent?
- Does a public read that calls a third-party API answer once rather than per caller, so nobody can spend the server's allowance for everyone?
- What does an anonymous or hostile caller do with this, at volume? That means rate limiting, storage quotas and growth bounded on the write path (`apps/web/content/docs/architecture/rate-limiting.md`, `apps/web/content/docs/resource/storage-quotas.md`, the `runtime-efficiency` skill).
- Does a public surface accept media or text a moderation story has not covered? Public user-generated media is deferred platform-wide (`apps/web/content/docs/post/deferred/post-images.md`).
- Does an anonymous write notify anyone, which would make it a harassment vector (`apps/web/content/docs/resource/deferred/survey-response-push.md`)?

## A07 Authentication Failures

- Does the change rely on the better-auth session, OAuth-only, and not a second login path (`apps/web/content/docs/architecture/auth.md`)?
- Does a token that stands in for a session (a webhook's secret url, the agent console's loopback token) stay out of logs and query strings a third party sees, and can it be rotated?
- Does a realtime connection authorize when it is made and again for each group it joins (`apps/web/content/docs/architecture/azure-services.md`)?

## A08 Software or Data Integrity Failures

- Is every payload crossing a boundary parsed by a Zod schema, never cast (the `zod` skill, `references/boundary-payloads.md`; the `error-handling` skill, `references/json-parsing.md`)?
- Does a deep merge or a key-by-key copy take keys from input, which is prototype pollution? `__proto__`, `constructor` and `prototype` must not reach an object's prototype.
- Does XML parsing (`packages/xml2js`) resolve no external entity?
- Does a content save check the version it was based on, so a stale client cannot overwrite a newer one (`apps/web/content/docs/resource/resource-save-state.md`)?

## A09 Security Logging and Alerting Failures

- Does a failed authorization or a rejected payload leave a server-side record, through the sink the error-handling rules name (the `error-handling` skill, `references/logging-sinks.md`)?
- Does a log line carry a token, a signed url, a session or a message body? It should carry none of them.
- Is a moderation action recorded in the moderation log (`apps/web/content/docs/esbabbler/moderation.md`)?

## A10 Mishandling of Exceptional Conditions

- Does a failed check stop the operation, failing closed, rather than log and carry on (the `error-handling` skill, `references/server-guards.md`)?
- Does a partial failure roll back what it already wrote, so no half-created row or orphaned blob is left granting access?
- Is every `Result` terminated, so no failure is silently dropped (the `error-handling` skill)?
