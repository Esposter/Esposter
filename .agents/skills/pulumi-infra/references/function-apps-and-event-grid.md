# Function Apps and Event Grid destinations

Read when a Function App reads as running but registers or executes nothing, or when a rename touches a function an event subscription names.

## Diagnose a Function App from execution, not from configuration

`az functionapp function list` and the host's own `/admin/functions` return the functions the host has
registered, and an empty answer on a v4-programming-model app means it registered none — the app reports
`Running` either way, because the host starts fine and simply loads nothing. The listing is the symptom, never
the diagnosis. What settles it is the behavioural signal, and it is free — no App Insights needed:

```bash
az monitor metrics list --resource <app> --resource-group <rg> --resource-type Microsoft.Web/sites --metric FunctionExecutionCount --aggregation Total --interval P1D --start-time <iso>
```

**Read it over a window wide enough to include known-good days before touching anything.** Daily non-zero totals
that stop on a date say the configuration was right and something shipped on that date; they rule out every
"missing setting" theory in one query. Getting that order wrong costs restarts of an app that needed none, an app
setting nothing needed, and an apply against an estate that was fine — and when the user says a thing has been
working, that is evidence to reconcile against rather than noise to disprove.

A cause that lives in the repo rather than the estate: a deploy artifact that loses the entry field its host
loads ships a package the host can mount and find nothing in (the `build` skill, `references/opt-outs.md`).

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
(observability is off — `openspec/specs/infra/observability/design.md`). So when a rename touches a function an event subscription
names, check that container's recency — it is the only place the breakage shows.
