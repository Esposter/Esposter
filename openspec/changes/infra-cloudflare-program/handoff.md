# Resuming the program on another machine

The program is built by one lead session that briefs haiku agents, each in its own worktree off `ai/cloudflare`, and lands their commits on that branch. This page is what a session needs to take the lead cold, on any machine. It is deleted when task 9.3 lands.

## Machine setup

Every credential the program uses is in Pulumi ESC, environment `esposter-infra/prod`. Nothing else holds a secret, and no value is ever printed: read one inside a command with `pulumi env get esposter-infra/prod <key> --value string --show-secrets`, write one with `pulumi env set ... --secret`, and report key names only.

1. `pulumi login`: Pulumi Cloud, which serves ESC and the `prod` stack. Pass `--stack prod` to every stack command.
2. Cloudflare needs no `wrangler login`. Wrangler and the provisioning scripts read `CLOUDFLARE_API_TOKEN`, exported from ESC for the length of a command: `export CLOUDFLARE_API_TOKEN="$(pulumi env get esposter-infra/prod pulumiConfig.cloudflare:apiToken --value string --show-secrets)"`. The account id is the committed constant `CLOUDFLARE_ACCOUNT_ID` in `packages/db-schema/src/services/cloudflare/constants.ts`. The bootstrap token (`pulumiConfig.cloudflare:bootstrapToken`) is kept until it expires on its own.
3. `gh auth status` for the push and CI. The Railway CLI (or its MCP server) is needed only for 9.3 and 9.5.
4. `git fetch origin && git switch ai/cloudflare`, `pnpm i`, then `pnpm exec vp run build:packages` before any app test.

## Deploying the develop estate by hand

CI's `.github/workflows/Deploy.yaml` deploys only `ai/queue` and `main`, so until 9.3 the develop estate is deployed from `ai/cloudflare` by hand, in the workflow's order, in a fresh worktree:

1. Build the two Workers' dependencies: `pnpm --filter "@esposter/web^..." --filter "@esposter/functions^..." build`.
2. Export `CLOUDFLARE_ENV=dev`, `CLOUDFLARE_ENVIRONMENT=dev`, `BASE_URL=https://dev.esposter.com`, `PUBLIC_ASSETS_BASE_URL=https://assets.dev.esposter.com`, the API token above, and each name in `.github/worker-secrets.json`'s `build` list from ESC key `pulumiConfig.esposter-infra:dev_<name>`.
3. `pnpm --filter @esposter/db-schema db:migrate`.
4. `pnpm -C apps/functions build && pnpm -C apps/functions deploy:worker`, then upload the `functions` list's secrets with `wrangler secret bulk <file>` from `apps/functions`. The file is written from ESC by a script and deleted right after.
5. `pnpm -C apps/web build && pnpm -C apps/web deploy:worker`, then the `web` list's secrets the same way from `apps/web`.

The functions Worker is deployed to dev with its secrets. The web Worker builds, and its upload was refused for one reason: `rate-limiter-flexible` starts a timer at module scope, which task 3.3 removes. Once the web Worker uploads, run the second targeted `pulumi up` of task 7.1: the queue consumers and the dev custom domains, never the `esposter.com` Workers domain, and never an untargeted `up`, because the `prod` stack still holds the live Azure estate. Then the owner points the dev OAuth apps at the table under 7.1 and checks `dev.esposter.com` by hand.

## Where the work stands

Landed but not yet ticked, because each task's own verification has not been run as one pass:

- The three objects (2.3–2.5).
- The room rewiring and the emitters' deletion (2.6), except the leftovers below.
- UUIDv7 everywhere (2.2).
- The RealtimeKit provisioning command (5.1), with dev and prod provisioned.
- The dead-letter consumer.
- `packages/azure` deleted.

A session ticks each of these after running its verification.

In flight when the lead handed off; each one pushes to `ai/cloudflare` when it finishes. Read `git log origin/ai/cloudflare` before taking any of them up, and redo only what did not land:

- Landed: message reminders are rows on the person's `UserObject` alarm, and the `Scheduler`, its binding, queue, handler and D1 table are deleted. The drop migration is generated but not applied, and the cutover imports pending reminders before it runs. The Pulumi files for the queue are unprotected in code, so apply the unprotect before the deletion.
- Not done: the generic streams layer and the `STREAMS` binding. Three things still hold it:
  - The shape types under `packages/db-schema/src/models/streams`, which live message models and `messagesInMessage` import. The cutover drops those tables.
  - The dev seed, `scripts/src/services/devSeed`, and the cutover tooling, which use the streams client.
  - `updateEntityConditionally`, which `openspec/specs/architecture/conditional-writes/design.md` names as its owner. That page is rewritten onto D1's guarded writes (`meta.changes`, task 3.4) in the same change.

  Only `useStreamTableClient`, the cursor helpers and that writer are dead.

- Rate limiting moves to the Workers Rate Limiting binding (3.3), which unblocks the web Worker's upload.
- Bearer tokens (webhook, program participant) are stored only as a SHA-256 hash, shown once at create or regenerate, and regenerated rather than revealed. Invite codes become 256-bit `generateSecretToken()` codes.
- The cutover (7.3):
  - Re-key every D1 row to a UUIDv7 built from its own `createdAt`.
  - Import each room's messages, numbered by `createdAt`, into its object.
  - Send pending scheduled messages to their rooms and reminders to their owners.
  - Revoke webhook and participant tokens: write the hash of a fresh token nobody receives.
  - Re-issue invite codes.
  - Drop the D1 message tables.
- Typecheck to clean, in the message, room and realtime code.
- The rest of the typecheck:
  - Workers types are server-only. The Cloudflare env and binding declarations leave `apps/web/shared/types/env.d.ts` for the server program, which loads `@cloudflare/workers-types` through its own tsconfig. That clears the browser program's `HTMLElement`-to-`Response` family.
  - Insert-selects whose `sql` fields are not aliased.
  - `MockJobQueue` implements the whole Workers `Queue`, including `sendBatch` and `metrics`.
  - Stale fixtures, and the `H3Event` imports from `nuxt/server`.
  - The single errors the last full typecheck listed. Run `pnpm typecheck` per package to list them again.
- Lint, fixed by hand. A rule that is itself the problem is trimmed or removed.

## Next, in order

1. Finish whatever above did not land, then the develop deploy and the second `pulumi up` (7.1).
2. Split `apps/functions` into "apps/realtime" and "apps/jobs" (2.7) before live queries (2.8), so the topic object is built on the final layout.
3. Live queries (2.8), with every deleted EventEmitter as the inventory of hand-built liveness to fold into topics.
4. 3.4, 3.6, 5.2 and 6.1, then the docs leftovers:
   - `SCORE.md` and `CONTRIBUTING.md`.
   - The `drizzle` skill's UUIDv7 and external-id rule.
   - The subscription pages of the `trpc` skill.
   - The `persistThenNotify` lint rule, which becomes "publish after write".
   - The Azure rows of the package build bench.
5. Section 9 in its order. At the end, write the local env files by script, never printing a value: `apps/web/.env` with dev values, `apps/web/.env.production` with prod values, and one per split Worker with only the variables it reads. All are gitignored.

## Owner rules for this program

- No compatibility debt: the old form is deleted in the change that replaces it. Redesigns are welcome.
- Every id the app mints is a UUIDv7 from the `uuid` package. External ids keep their own version.
- Credentials follow best practice even when links change: 256-bit tokens, hashed at rest, shown once.
- Fix every gap and refactor found, without asking. Check outside state with the CLIs and APIs rather than asking the owner.
- The owner confirms first before:
  - the production data copy;
  - the apex DNS switch;
  - any teardown;
  - any production `pulumi up` beyond a targeted one.
- `main` is pushed only by the owner's sync to main at 9.3.
- npm: `azure-mock` and `@esposter/azure` are deprecated after landing, and unpublished once their weekly downloads fall below 300. The owner supplies the one-time codes.

## Briefing agents

Each agent gets its own worktree, `git worktree add -b cf-<name> .agents/worktrees/cf-<name> origin/ai/cloudflare`, and works only there. Its brief points at `AGENTS.md`, this program's design, the part design it builds and the skills its files hit, and names the files it owns.

When it lands, it commits by pathspec, then runs `git pull --rebase origin ai/cloudflare` and `git push origin HEAD:ai/cloudflare`, retrying up to four times. It never force-pushes, never pushes `ai/queue` or `main`, and runs only the suites it touched. Its last message reports its commits, what it left and why, and anything that contradicts the design.

## Left when the lead stopped

Each item names its next step.

- The web Worker builds again. Next is the develop deploy above. The functions Worker is deployed, and rate limiting is on the binding, so nothing is known to block the web upload.
- Cutover: the re-key, the room import and the drop of the D1 message tables have landed.
  - A real run needs a reader for the old estate's pending scheduled messages and reminders, because their D1 table is gone.
  - Its known gaps: a delta does not delete messages the source no longer lists; verify does not round-trip sample text; the old ids' version is unverified.
- Rate limiting: the API-key plugin still uses better-auth's own limiter, which is stored in D1. Move it onto a binding.
- Typecheck in the message, room and realtime code fell to about 130 errors. These need a decision each:
  - Untyped bindings in `searchMessages`, `readMySentMessages`, `getCallObject` and the realtime composables.
  - `useReadMessages` needs an `after` read that the room object does not serve.
  - `readBans` pages by `id`.
  - `closeSession` is missing from the room and call RPC contracts. Session revocation needs it.
  - `useUserSubscribables` passes a null status.
  - The joinRoom payload lacks `displayName`.
  - `updateUserToRoom` passes a transaction into the RBAC helper.
  - `useSingletonDialog` now takes number targets, against the string-target convention.
- One room `leaves` test times out. It may be the new rate-limit middleware; that is unconfirmed.
- Lint: its agent's fixes are on the branch. Run `vp lint` again to find what remains, and fix by hand.
