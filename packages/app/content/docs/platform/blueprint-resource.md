---
title: Blueprint Resource
description: A parameterized, executable manifest of resources — deploy one Blueprint and get a fully wired set of resources with all the right settings and cross-references.
---

# Blueprint Resource

A **Blueprint** is a resource whose content is a **manifest**: a list of resource entries (each with a type, a name, and full content) plus a list of parameters. **Deploying** a blueprint substitutes the parameter values, creates every entry as a real resource through the standard write paths, and rewires the cross-resource references between them — turning N manual create → configure → bind steps into one parameterized action. It is the platform's answer to "set this whole thing up again, but for the next client": build once, capture, redeploy forever.

The shape is the industry-standard declarative template (ARM/Bicep templates, CloudFormation, Backstage software templates) reduced to its minimum: a manifest, string parameters, and local aliases for cross-entry references. No expression language, no conditions, no deployment engine — substitution plus topological create order, synchronous, in one procedure call.

## How it works

```mermaid
flowchart LR
  ED["Editor blade<br/>manifest JSON"] -->|saveResourceContent| BLOB[("{id}/content<br/>manifest")]
  CMD["Deploy command<br/>parameter form dialog"] -->|"deployBlueprint { id, parameterValues }"| SUB["substitute {{parameter:key}}<br/>in names and content strings"]
  SUB --> VAL["pre-validate every entry against its<br/>type contentSchema (placeholder ids for {{entry:key}})"]
  VAL --> TOPO["topo-sort entries by<br/>{{entry:key}} references"]
  TOPO -->|"per entry: insert resources row +<br/>upload content blob (real ids substituted)"| RES[("created resources")]
  VAL -->|any entry invalid| REJECT["reject — nothing created"]
  TOPO -->|mid-deploy failure| CLEAN["compensating cleanup —<br/>delete already-created rows + blobs"]
```

- **Content schema** (the manifest):

  ```ts
  interface BlueprintResource {
    entries: { content?: unknown; key: string; name: string; type: ResourceType }[];
    parameters: { defaultValue: string; description: string; key: string; title: string }[];
  }
  ```

  `key` is the entry's **local alias**, unique within the manifest. `name` becomes the created resource's name. `content` is the entry type's normal content shape — validated against `ResourceDefinitionMap[type].contentSchema` after substitution, so a blueprint can never deploy content the type's own save path would reject.

- **Token grammar** — two tokens, both plain string substitution over the JSON's string values:
  - `{{parameter:<key>}}` — replaced with the deploy-time parameter value (in entry names and any content string). All parameters are strings in v1; typed parameters are a later extension of the parameter object, not a redesign.
  - `{{entry:<key>}}` — replaced with the **created resource id** of that entry. This is how a dashboard entry binds the sheet entry's dataset, or a program entry binds its email and survey — the same bare-id linking every cross-resource reference already uses ([resources](/docs/architecture/resources)), just late-bound.

- **Deploy** (`deployBlueprint`, owner): substitute parameters → pre-validate every entry's substituted name and content, with placeholder UUIDs standing in for `{{entry:*}}` (so a bad manifest rejects before anything is created, rather than mid-loop against a database constraint) → topologically sort entries by the `{{entry:*}}` references that validation walk already collected (cycles and unknown references reject) → create each entry in order via the standard primitives (`resources` insert + content blob upload + the type's registered after-save hook, exactly what `createResource` + `saveResourceContent` do) with real ids substituted. A mid-deploy failure deletes the rows and blobs it already created — best-effort all-or-nothing. Returns the alias → created-resource pairs; the Deploy dialog shows links to everything it made.

- **An entry with no content** deploys to a resource with no content blob. That is the state a resource is genuinely in until its first save, so [capture](/docs/platform/blueprint-capture) records the absence rather than standing an empty object in — most types' schemas reject `{}`, and one unparseable entry rejects every deploy of the whole manifest.

- **Blueprints of blueprints**: an entry may itself be `type: Blueprint` — deploying creates the child Blueprint resource with its manifest as content, like any other entry (it is **not** recursively deployed; recursive composition is a [deferred](/docs/platform/deferred) candidate, not v1). A `Blueprint` entry's content is therefore **opaque to the outer deploy**: its `{{entry:*}}` and `{{parameter:*}}` tokens name the child's own entries and parameters, so nothing walks into it — no dependency edges, no substitution, no id rewriting on capture. One helper (`mapBlueprintEntryContentStrings`) owns that decision and every content pass goes through it, so a new pass cannot be written that forgets.

- **Blades**: Overview and the **Editor** — the manifest edited as schema-validated JSON (the escape hatch, since [capture](/docs/platform/blueprint-capture) is the primary authoring path), with **Save** and a **Deploy** command opening the parameter form dialog (plain text fields generated from `parameters`, defaults prefilled).

## Procedures

`blueprint` router = `createResourceProcedures(ResourceType.Blueprint)` plus:

| Procedure         | Auth  | Input                                             | Purpose                                                         |
| ----------------- | ----- | ------------------------------------------------- | --------------------------------------------------------------- |
| `deployBlueprint` | owner | `{ id, parameterValues: Record<string, string> }` | substitute → validate → topo-create → return alias→resource map |

Its twin, [`captureBlueprint`](/docs/platform/blueprint-capture), joins the same router.

## Key files

| File                                                              | Role                                             |
| ----------------------------------------------------------------- | ------------------------------------------------ |
| `packages/db-schema` `ResourceType.Blueprint` + migration         | new type value                                   |
| `packages/app/shared/models/resource/blueprint/`                  | manifest schema (entries, parameters)            |
| `packages/app/shared/services/resource/blueprint/`                | token grammar (constants, entry-token builder)   |
| `packages/app/shared/services/resource/ResourceDefinitionMap.ts`  | Blueprint entry                                  |
| `packages/app/server/trpc/routers/blueprint.ts`                   | factory + `deployBlueprint` + `captureBlueprint` |
| `packages/app/server/services/blueprint/`                         | substitution, validation, topo-sort, cleanup     |
| `packages/app/app/components/Resource/Blueprint/Editor.vue`       | manifest editor blade                            |
| `packages/app/app/components/Resource/Blueprint/DeployDialog.vue` | parameter form + created-resources result        |

## Notes

- **Naming.** _Blueprint_ — a plan you execute. Considered and set aside: **Template** (collides with the merge-field template language in Email/Webpage and with single-resource starter templates — which this supersedes), **Stack** (CloudFormation's word, but it names the deployed _output_, not the plan), **Module** (code connotation), **Recipe**/**Kit** (cutesy). Azure retired its unrelated "Azure Blueprints" governance product; the word carries no baggage here.
- **Supersedes the resource-templates deferral.** A single-entry blueprint with no parameters _is_ a starter template, and user-authored templates were exactly the "whole feature" that page deferred. Built-in starter blueprints (an authored gallery) remain future work.
- **Deliberately no engine.** No conditions, loops, expression functions, or nested-deploy. If a manifest needs logic, the answer is a second blueprint, not a language. The extension seam is the manifest schema (typed parameters, entry-count growth), same posture as the [Program](/docs/platform/program-resource) content schema.
- **Exact-match id rewiring is safe** because resource ids are UUIDs — deploy (and capture) replace whole-string matches only; no risk of corrupting prose that merely mentions an id fragment.
- Deployed resources are ordinary resources with no live link back to the blueprint — editing the blueprint never mutates past deployments (exactly ARM's template/deployment split).
- The canonical motivating manifest: **survey funnel wave** — audience Sheet + Identified Survey + tokened Email + Program + funnel Dashboard, one `client` parameter in names and email subject. Deploy per client; each wave lands fully wired.
- **Agentic by design.** A manifest is pure schema-validated JSON deployed through ordinary procedures — the ideal unit for AI authoring: an agent emits a manifest, the platform validates it against every entry type's contentSchema, and deploy is the only side-effectful step. Every schema decision here (explicit tokens, no hidden state, validation before creation) keeps that path open: whatever creates resources — human, form, or model — goes through this same front door.
