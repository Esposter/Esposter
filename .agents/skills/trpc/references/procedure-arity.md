# Procedure Arity — Single First, Batch by Promotion

Read when writing a procedure that acts on an entity, when a surface starts acting on a set of them, or when a
router holds a single and a batch procedure for the same operation.

**A procedure takes one entity until a caller acts on a set.** The single form is the simplest thing that works: it
takes an ownership guard that hands the handler the row (`getOwnerProcedure` sets `ctx.resource`), it fails with a
status that says which entity was wrong, and its caller passes an id rather than an array of one. A batch buys
none of that back until something really sends many. Writing one first for a surface that acts on one item is the
mechanism listed under "The catalogue" in `.agents/skills/over-engineering/SKILL.md`, promoted for a single consumer.

**Promotion replaces, never adds.** When a surface does act on a set, such as a selection's toolbar or an undo that
reverses a bulk act, the operation becomes a batch procedure and the single one is deleted. The one-item callers
send one id. A single and a batch for the same operation are two code paths for one behaviour, and they drift in
exactly the ways a batch differs: which rows the guard admits, what the notification says, what a missing row does.

```mermaid
flowchart TD
  NEW["a procedure that acts on an entity"] --> SET{"does a caller act on a set of them"}
  SET -->|"no"| SINGLE["single — one id, the ownership guard, a status per entity"]
  SET -->|"yes — a selection, a bulk undo"| TWIN{"is there a single procedure for it already"}
  TWIN -->|"no"| BATCH["batch — ids, owner-scoped where"]
  TWIN -->|"yes"| REPLACE["promote — the batch replaces it, and one-item callers send one id"]
  REPLACE --> BATCH
```

## What a promoted procedure owes

- **The guard moves into the where.** A batch has no `ctx.resource`, so it scopes its own statement to the caller
  and the state the operation needs: `deleteResources` matches the owner's live rows, `restoreResources` the owner's
  binned rows. A row outside that scope is skipped and absent from the result, never an error, since one foreign id
  must not fail the rest of the set.
- **The caller chunks to the cap.** The input caps its ids at `MAX_READ_LIMIT`, and a selection that spans pages
  sends its ids in order, chunk by chunk (`useDeleteResources`, `useRestoreResources`).
- **Its words take a count.** A title or notification the single form wrote for one name takes the count too
  (`ResourceOperationTitleMap`), so a one-item batch reads exactly as the single form did.
- **Its input keeps a file of its own.** Two batch procedures over the same shape still take one input schema each
  (`references/file-placement.md`).

## The arity rule

Read the input schema, not the name: a batch takes `ids`, a unique array of at least one capped at `MAX_READ_LIMIT`,
and scopes its where to the caller. A single takes one `id` and is built on `getOwnerProcedure`, which sets
`ctx.resource` for the handler. Two routers hold the rule:

- `apps/web/server/trpc/routers/resource.ts` — `deleteResources` and `restoreResources` take `ids`; `purgeResource`
  takes `id` through `getOwnerProcedure`.
- The per-type routers `createResourceProcedures` builds (`apps/web/server/trpc/procedure/resource/createResourceProcedures.ts`,
  e.g. `apps/web/server/trpc/routers/note.ts`) — `deleteResource` takes `id` through `getOwnerProcedure(type, …)`.

**The one exception is a single form that carries what the batch cannot.** A form keyed on its path stays beside the
batch: a type's `deleteResource` names the type in its path, which a typeless `resource.deleteResources` cannot say,
and the resource page calls it through the type's router for that reason. Anything that keys on a path is the test:
with nothing keyed on the single form's path, it goes.
