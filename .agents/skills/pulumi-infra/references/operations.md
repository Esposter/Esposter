# Running preview and up

Read when running `pnpm infra:preview` / `pnpm infra:up`, after a catalog bump to a `@pulumi/*` provider package, or when a resource reads as deployed but demonstrably does not work.

## Verification order

Run in order from `packages/infra/`, always before `infra:preview` or `infra:up`:

1. `pnpm typecheck` — TypeScript type check.
2. `pnpm lint:fix` — auto-fix lint. Run it from the package folder, not as `pnpm --filter @esposter/infra lint:fix` from the root, to avoid path issues.
3. `pnpm infra:preview --suppress-outputs` — confirm scope before applying.
4. `pnpm infra:up --yes --suppress-outputs` — apply only after the preview is confirmed.

`infra:preview` and `infra:up` both run `pnpm build` themselves — never run `pnpm build` separately first.

## Rules around an apply

- Never use `pulumi up --skip-preview`.
- Before applying, confirm the preview contains only the intended resources and properties for the active roadmap item.
- If `pulumi up` partially succeeds or fails, stop and run `pnpm infra:preview` again before any follow-up apply.
- **`preview` and `up` diff the program against state, never against Azure**, so an `up` reporting `unchanged` is not evidence that the live estate matches — anything changed out of band is invisible to both. When something reads as deployed but does not work, run `pnpm infra:refresh` before concluding the code is wrong, and check RBAC against Azure directly (`az role assignment list --assignee <principalId> --all`): a role assignment present in state and absent in Azure fails at runtime with `Forbidden` behind a clean preview.

## The first `up` after a provider bump cannot be targeted

State pins the default provider each resource was last written with (`pulumi:providers:github::default_6_14_1`), so a catalog bump to a provider package makes the program register a version state has never seen. Under `--target`, Pulumi registers providers only for the targeted resources, so the untargeted ones' provider is missing and it refuses:

```text
error: provider …:pulumi:providers:github::default_6_14_0::… for resource …
has not been registered yet, this is due to a change of providers mixed with --target
```

This is not drift to repair and no CLI upgrade fixes it. Run the update **untargeted** — plain `pnpm infra:up`, or `pulumi up --exclude <urn>` when specific resources must be held back, since `--exclude` still registers every provider. That run re-associates the resources onto the new provider, and `--target` works again until the next bump. `--exclude` accepts wildcards, so `--exclude "**::<resource-name>"` holds back one resource by name.

Hold a resource back when its Azure-side create depends on something not yet deployed — an Event Grid subscription is validated against its function endpoint at create time, so a subscription for a function that only exists in an unreleased build fails until that release lands (`packages/app/content/docs/infra/eventgrid-dead-letter.md`).

## Diagnose a Function App from execution, not from configuration

`az functionapp function list` and the host's own `/admin/functions` return the functions the host has
registered, and an empty answer on a v4-programming-model app means it registered none — the app reports
`Running` either way, because the host starts fine and simply loads nothing. The listing is the symptom, never
the diagnosis. What settles it is the behavioural signal, and it is free — no App Insights needed:

```bash
az monitor metrics list --resource <app> --resource-group <rg> --resource-type Microsoft.Web/sites   --metric FunctionExecutionCount --aggregation Total --interval P1D --start-time <iso>
```

**Read it over a window wide enough to include known-good days before touching anything.** Daily non-zero totals
that stop on a date say the configuration was right and something shipped on that date; they rule out every
"missing setting" theory in one query. Getting that order wrong costs restarts of an app that needed none, an app
setting nothing needed, and an apply against an estate that was fine — and when the user says a thing has been
working, that is evidence to reconcile against rather than noise to disprove.

The cause seen here was in the repo rather than the estate: the deploy artifact lost the entry field its host
loads, so every build shipped a package the host could mount and find nothing in
(`.agents/skills/build/SKILL.md`).

On a Consumption plan the app scales to zero and re-fetches `WEBSITE_RUN_FROM_PACKAGE` on the next cold start,
which is why a deploy that only uploads the package needs no restart or trigger-sync step to take effect.

## Event Grid resolves a function destination through ARM

An `AzureFunction` destination is `${site.id}/functions/${name}`, and Azure validates that path when the
subscription is created or updated. If the app has registered no functions, validation fails with
`Status=400 Code="InvalidRequest" ... Webhook endpoint validation failed ... StatusCode: NotFound` and the
update cannot be applied — `up` leaves state untouched rather than half-applied, so the failure is safe to stop
at and diagnose.

The trap is what happens meanwhile: the **old** subscription keeps delivering to a name the code no longer
registers, and every event dead-letters silently, because nothing alerts off the deadletter container
([observability is off](/docs/infra/observability)). So when a rename touches a function an event subscription
names, check that container's recency — it is the only place the breakage shows.
