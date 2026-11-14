# Tasks

A session taking the program up cold, on any machine, starts from [the handoff](handoff.md): the machine setup, the hand deploy of the develop estate, and what is in flight.

## 1. Parts

- [ ] 1.1 Ship [runtime](../infra-cloudflare-runtime/tasks.md). Verified by its tasks all ticked.
- [ ] 1.2 Ship [database](../infra-cloudflare-database/tasks.md). Verified by its tasks all ticked.
- [ ] 1.3 Ship [storage](../infra-cloudflare-storage/tasks.md). Verified by its tasks all ticked.
- [ ] 1.4 Ship [jobs](../infra-cloudflare-jobs/tasks.md). Verified by its tasks all ticked.
- [ ] 1.5 Ship [calls](../infra-cloudflare-calls/tasks.md). Verified by its tasks all ticked.
- [ ] 1.6 Ship [pulumi](../infra-cloudflare-pulumi/tasks.md). Verified by its tasks all ticked.
- [ ] 1.7 Ship [cutover](../infra-cloudflare-cutover/tasks.md). Verified by its tasks all ticked.

## 2. Realtime and ids

- [ ] 2.1 Land the realtime foundation: the three event unions, the object skeletons and their bindings, the authenticated `/ws/user`, `/ws/room/:roomId` and `/ws/call/:callSessionId` routes, and the client connection manager ([realtime](../infra-cloudflare-realtime/tasks.md) 1.1, 3.1). Verified by the socket route tests.
- [ ] 2.2 Mint every D1 id with the `uuid` package's `v7`, validate `z.uuidv7()`, page creation-ordered cursors on `id` alone, and ban `crypto.randomUUID` and `uuid`'s `v4` by lint (realtime 1.2). Verified by the cursor tests and the lint rule's cases.
- [ ] 2.3 Build `RoomObject` and move every room-scoped mutation and its events onto it: messages with per-room integer ids, reactions, room emojis, roles, moderation, typing, the external-content FTS5 table, replay after an id, online members and the debounced room-activity fan-out, scheduled messages on its alarm, erase, export and delete (realtime 2.2). Verified by its Miniflare tests.
- [ ] 2.4 Build `CallObject` and move the call maps, the knock flow, the RealtimeKit webhook and the revoke's rejoin onto it (realtime 2.3). Verified by its Miniflare tests.
- [ ] 2.5 Build `UserObject` and move achievements, friends, storage usage, Genshin session replacement, resource saves on other devices, room-list events and mention counts onto it, with the sent-message and scheduled-message index, TodoList reminders on its alarm, and session revocation closing sockets on every object (realtime 2.1). Verified by its Miniflare tests.
- [ ] 2.6 Delete the fourteen EventEmitters, every tRPC subscription procedure and `use*Subscribables` composable, the `$DurableObject` binding and `trpcDurableObject.ts`, `/_internal/publish`, the `Scheduler` object, and the scheduled-message and todo-reminder queues with their dead-letter queues in Pulumi (unprotect, then remove). Verified by no import of them remaining.
- [ ] 2.7 Split `apps/functions` into `apps/realtime` and `apps/jobs` (realtime 5.1). A folder under `apps/` is a unit that deploys — a Worker, a Pulumi program — and a folder under `packages/` is a library apps import, so both new Workers and `apps/infra` stay apps. Verified by each Worker's wrangler test.
- [ ] 2.8 Ship [live queries](../infra-cloudflare-live-queries/tasks.md): every query declares its topics, every mutation publishes the ones it changed, and the client refetches what is on screen. Verified by its tasks all ticked.

## 3. Database and storage leftovers

- [ ] 3.1 Finish the transactions-to-batches conversion in the resource, storage and router files, including the snapshot lease row that replaces `pg_advisory_xact_lock` and R2 multipart for the user-data archive. Verified by the guarded-write tests.
- [ ] 3.2 Point `apps/web/server/trpc/context.ts` and the functions Worker's `db.ts` at the D1 binding, and delete the `postgres` driver from every manifest but the cutover's. Verified by the context test.
- [x] 3.3 Replace `rate-limiter-flexible` with the Workers Rate Limiting binding declared in the web Worker's wrangler config. Verified by the rate-limit middleware test.
- [ ] 3.4 A batch update or delete that matches no row throws `NotFoundError` from `meta.changes`, as the Azure 404 did. Verified by a not-found test per writer.
- [x] 3.5 Move `apps/web/scripts/phaser/filePack/createFilePack.ts` and `getGenshinGameDataBaseUrl.ts` to R2, delete `packages/db/src/services/azure/container/getContainerClient.ts`, the generic streams layer, `packages/azure`, the `STREAMS` binding and every `@azure/*` dependency outside the cutover tool. Verified by no `@azure/` import outside `scripts/src/services/cutover`.
- [x] 3.6 Regenerate one fresh `core` migration with `db:gen`, then `registry:gen` and the schema snapshot. Verified by the migration applying on Miniflare.
- [x] 3.7 Give every dead-letter queue a consumer on the jobs Worker that republishes under the attempt cap and quarantines to R2 past it or on an invalid body, counted per message ([jobs](../infra-cloudflare-jobs/design.md)). Verified by the dead-letter consumer test.

## 4. Tests

- [ ] 4.1 Move every suite still importing `azure-mock` onto `@esposter/db-mock`, fix the `createMockDb` "must be of scheme file" load error, the `createMockDb` call sites that expect a raw database, `trpc-msw`'s build, the hoisted `useScheduler` mock, the epoch-zero clock in `drizzleAdapterConfiguration.test.ts`, the account-id casing in `createPresignedPutUrl`'s test, and the count assertions that spy on a Miniflare bucket's `get` (`writeSnapshotVersion`, the reconcile tests), which assert on the bucket's contents instead. Verified by `apps/web`, `apps/functions` and `packages/db` suites loading.

## 5. Calls

- [x] 5.1 A provisioning command creates each environment's RealtimeKit app, the four presets and the webhook subscription, and writes `REALTIMEKIT_APP_ID` and `REALTIMEKIT_API_TOKEN` to ESC under `dev_` and `prod_`. Verified by a dry run listing what it would create.
- [x] 5.2 Replace `MicrophoneProcessor`'s `ScriptProcessorNode` with an AudioWorklet. Verified by the microphone processor test.

## 6. Bundle

- [ ] 6.1 Take the email editor's compile chain (cosmiconfig, htmlnano, mjml) and `@tiptap/html`'s happy-dom out of the server bundle, and correct the runtime design's bundle paragraph: only `.client.vue` or an `ssr: false` route rule removes a library from it. Verified by `server-bundle:check`.

## 7. Deploy and cutover

- [ ] 7.1 Deploy both Workers to the develop estate with `wrangler deploy`, then run the second `pulumi up` for the queue consumers and custom domains, so `ai/queue` deploys to `dev.esposter.com` and `main` to `esposter.com`; each OAuth app (GitHub, Google, Facebook) lists `https://dev.esposter.com` and `https://esposter.com` callbacks in place of the Railway hosts. Verified by `dev.esposter.com` serving and a sign-in on it.
      The console settings, each replacing the Railway host (better-auth serves its callbacks under `/api/auth/callback/<provider>`):

  | Provider | Field                         | Dev app                                               | Prod app                                          |
  | :------- | :---------------------------- | :---------------------------------------------------- | :------------------------------------------------ |
  | GitHub   | Homepage URL                  | `https://dev.esposter.com`                            | `https://esposter.com`                            |
  | GitHub   | Authorization callback URL    | `https://dev.esposter.com/api/auth/callback/github`   | `https://esposter.com/api/auth/callback/github`   |
  | Google   | Authorized JavaScript origins | `https://dev.esposter.com`                            | `https://esposter.com`                            |
  | Google   | Authorized redirect URIs      | `https://dev.esposter.com/api/auth/callback/google`   | `https://esposter.com/api/auth/callback/google`   |
  | Facebook | App domains                   | `dev.esposter.com`                                    | `esposter.com`                                    |
  | Facebook | Website site URL              | `https://dev.esposter.com`                            | `https://esposter.com`                            |
  | Facebook | Valid OAuth redirect URIs     | `https://dev.esposter.com/api/auth/callback/facebook` | `https://esposter.com/api/auth/callback/facebook` |

  Local development keeps `http://localhost:3000` on the dev apps.

- [ ] 7.2 Confirm the deploy job runs migrations before `wrangler deploy`, uploads secrets with `wrangler secret bulk`, and is never cancelled mid-deploy. Verified by one green deploy run.
- [ ] 7.3 Teach the cutover to re-key D1 rows to UUIDv7 through the id map and import each room's messages and pending scheduled messages into its object (realtime 4.1), then rehearse the whole cutover on the develop estate. Verified by `verify` passing on develop.
- [ ] 7.4 Run the production cutover on `next.esposter.com`, switch the apex record from Railway to the web Worker, soak, then tear down: the Azure resources and `src/azure` in Pulumi, the Railway services, the cutover tool and its reschedule route. The `esposter.com` nameservers already point at Cloudflare. Verified by the cutover design's checks.

## 8. Docs and names

- [ ] 8.1 Sweep every spec, skill, ledger and README for the retired platform: delete pages describing retired mechanisms, merge duplicates, give the `drizzle` skill its D1 rules (batches, guarded writes, FTS5, `json_each`, the hundred-parameter cap), and replace the root README's Railway and Postgres badges with Cloudflare's. Verified by no mention of Azure, Railway, LiveKit, Postgres or Web PubSub outside the cutover and the archive.
- [ ] 8.2 Rename any package, folder or identifier still named for the retired platform. Verified by the same search.

## 9. Finish, in this order

- [ ] 9.1 Everything above lands, the develop estate on `dev.esposter.com` is checked by hand, and CI's tests, typecheck and lint are green on `ai/cloudflare`. Verified by one green CI run on the branch.
- [ ] 9.2 A review pass over the whole branch (the `code-review` skill, both lanes), its findings fixed on the branch. Verified by the pass ending with nothing left to fix.
- [ ] 9.3 Land by the owner's sync to main, not through the review: the branch was reviewed in 9.2, and the review's windows would only re-read it. First disconnect the Railway `Esposter` service's GitHub source in both environments (production deploys `main`, develop deploys `ai/queue`), so their running deployments keep serving and no push rebuilds them; keep the `esposter.com` Workers custom domain out of the stack until the cutover, so the apex record stays on Railway. Then rebase `ai/cloudflare` onto `ai/queue` and push the one commit to `main` and then to `ai/queue`, so the review finds nothing owed; `main`'s deploy puts the production Workers behind `next.esposter.com` and `ai/queue`'s puts develop on `dev.esposter.com`. Verified by `main` and `ai/queue` naming the same commit and both Railway environments still serving.
- [ ] 9.4 Run the production cutover (7.4): copy the data, switch the apex from Railway to the web Worker's `esposter.com` custom domain in one commit, soak. Verified by the cutover's checks.
- [ ] 9.5 Tear down the old estate: the Railway services deleted through the Railway CLI, the Azure resources removed through Pulumi, then the owner cancels the Railway plan, and the retired npm packages (`azure-mock`, `@esposter/azure`) are deprecated once nothing on `ai/queue` installs them and unpublished when npm's policy allows it (under three hundred downloads a week), with the owner's one-time codes. Verified by no Railway service or Azure resource remaining.
