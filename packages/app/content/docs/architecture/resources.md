---
title: Resources
description: The standard for product persistence and surface — one Postgres table, one blob container, one procedure factory, opt-in capabilities.
---

# Resources

The standard for product persistence and product surface. **Everything is a resource**: a file, a survey, a todo list, a dashboard, an email, a webpage, a flowchart. One Postgres table, one blob container, one procedure factory, one explorer UI. Cross-cutting behaviors (publishing, dataset serving, import/export) are opt-in **capabilities**, never baked into the core.

## Anatomy

A resource is three things: an identity row (Postgres), a content blob (Azure Blob), and a definition (shared code).

```mermaid
flowchart LR
  subgraph pg [Postgres — identity and lifecycle]
    ROW["resources row<br/>id · type · name · userId · contentVersion"]
    PUBROW["resource_publications row (exists iff published)<br/>resourceId · publishVersion · publishedAt"]
    ROW -. "1:0..1 (Publishable)" .-> PUBROW
  end

  subgraph blob [Azure Blob resource-assets container]
    CONTENT["{id}/content<br/>working copy — per-type Zod schema"]
    PUB["{id}/published/{publishVersion}<br/>immutable snapshots (Publishable only)"]
    FILES["{id}/files/…<br/>binary assets (Survey uploads)"]
  end

  subgraph def [ResourceDefinitionMap entry — shared, as-const]
    D["contentSchema · icon · title<br/>capabilities: publishable? datasetProvider? portable?"]
  end

  ROW -- "id = blob path prefix" --> CONTENT
  CONTENT -- "publishResource copies" --> PUB
  D -- "validates" --> CONTENT
  D -- "gates procedures, blades, commands" --> ROW
```

**Settings vs data is a UX separation, not a storage separation.** A resource's parse settings and its actual data are distinct sections of one content blob, edited in distinct blades, saved through one procedure with one `contentVersion`. Never split one artifact across two write paths.

## Data model

Drizzle table `resources` (`packages/db-schema/src/schema/resources.ts`) — pure identity + content lifecycle:

| Column           | Type                   | Notes                                                        |
| ---------------- | ---------------------- | ------------------------------------------------------------ |
| `id`             | uuid PK                | becomes the blob path prefix                                 |
| `type`           | `ResourceType` pg enum | Dashboard, Email, File, Flowchart, Survey, TodoList, Webpage |
| `name`           | text + length check    | `createNameSchema` pattern                                   |
| `userId`         | FK → users, cascade    | owner; resources are single-owner                            |
| `contentVersion` | integer                | optimistic concurrency on content saves                      |

Publish state is **normalized into its own table**, `resource_publications` — a row exists iff the resource is currently published. Publishing is a capability, not a base attribute, so publish columns do not belong on every resource row:

| Column           | Type                             | Notes                                      |
| ---------------- | -------------------------------- | ------------------------------------------ |
| `resourceId`     | uuid PK, FK → resources, cascade | one publication per resource               |
| `publishVersion` | integer, default 1               | keys the immutable published blob snapshot |
| `publishedAt`    | timestamp, default now           | when the current publish happened          |

Content blobs live in one container, `AzureContainer.ResourceAssets`, keyed by id only (type lives in the row; ids are UUIDs — a type prefix would duplicate authoritative data into path strings):

```text
{id}/content                      working copy (JSON, validated by the type's content schema)
{id}/published/{publishVersion}   publish snapshots (Publishable only)
{id}/files/…                      type-owned binary assets (e.g. Survey uploads)
```

Ownership is enforced through the Postgres row, never inferred from the blob path. Deleting a resource deletes the row and the `{id}/` blob directory — identically for every type.

Each type owns one content schema (Zod, interface-first, one export per file) in `packages/app/shared/models/`. A content schema always produces an **object** (never a bare string/array) so future fields extend without a blob-shape break.

## Capabilities

A capability is a cross-cutting mechanism a resource type opts into via its definition. **Admission rule: a capability exists only when ≥2 resource types need the same mechanism, or when the type system must guarantee its absence** (a TodoList must not have publish endpoints). Anything used by exactly one type is type-specific code — promoting a single-consumer mechanism is over-engineering.

| Capability          | Contract                                                                                                                                               | Adopters                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| **Publishable**     | versioned snapshot + publish procedures + `/view/[type]/[id]` route + Publish command → [/docs/architecture/publishing](/docs/architecture/publishing) | Dashboard, Survey, Webpage                                             |
| **DatasetProvider** | registers a provider so `dataset.readDataset` resolves the type → [/docs/architecture/datasets](/docs/architecture/datasets)                           | File, Survey (responses)                                               |
| **Portable**        | import/export via declared formats (self-contained `export()` / `import()`) + Import/Export commands                                                   | File (csv/json/xlsx, both ways), Email (personalized html export only) |

Explicitly **not** capabilities: collecting public responses (Survey-only — stays survey-specific code) and dataset _consumption_ (just calling `dataset.readDataset` from a component; no per-type wiring to declare).

### Declaration — `ResourceDefinitionMap`

One shared as-const-satisfies map (`packages/app/shared/services/resource/ResourceDefinitionMap.ts`) is the single source of truth for what a type is: its `contentSchema`, `icon`, `title`, and `capabilities` (`{ datasetProvider?: true; portable?: true; publishable?: true }`), keyed by `ResourceType`.

A generic mapped type derives the subset of types declaring each capability:

```typescript
// packages/app/shared/models/resource/CapabilityResourceType.ts
export type CapabilityResourceType<TCapability extends keyof ResourceCapabilities> = {
  [T in ResourceType]: (typeof ResourceDefinitionMap)[T]["capabilities"] extends Record<TCapability, true> ? T : never;
}[ResourceType];
```

`PublishableResourceType`, `DatasetProviderResourceType`, and `PortableResourceType` are its aliases, and `hasCapability(type, capability)` is the matching runtime type guard. Capability implementation maps are keyed by the derived unions — `ViewComponentMap: Record<PublishableResourceType, Component>`, `PortableFormatMap: Record<PortableResourceType, …>` — so a missing view page or format entry is a compile error, and adding one for a non-capable type is also a compile error.

### Wiring

```mermaid
flowchart TB
  DEF["ResourceDefinitionMap[type].capabilities<br/>(shared, as-const-satisfies)"]

  DEF -->|"derives literal unions"| UNIONS["PublishableResourceType<br/>DatasetProviderResourceType<br/>PortableResourceType"]

  subgraph server [Server]
    FACTORY["createResourceProcedures(type, options?)"]
    BASE["base: create/read/update/delete<br/>readResourceContent/saveResourceContent"]
    PUBP["+ publishResource / unpublishResource /<br/>readResourcePublication / readPublishedResourceContent"]
    DPM["DatasetProviderMap<br/>Record&lt;DatasetProviderType, provider&gt;"]
  end

  subgraph client [Client]
    BLADES["ResourceBladeDefinitionMap — type blades"]
    CMDS["Toolbar commands<br/>Publish · Import · Export"]
    VIEWS["ViewComponentMap<br/>Record&lt;PublishableResourceType, view page&gt;"]
    FMT["PortableFormatMap<br/>Record&lt;PortableResourceType, formats&gt;"]
  end

  UNIONS -->|"conditional return type:<br/>publish procedures exist iff publishable"| FACTORY
  FACTORY --> BASE
  FACTORY -.->|"publishable types only<br/>(compile error otherwise)"| PUBP
  UNIONS --> VIEWS
  UNIONS --> FMT
  FMT --> CMDS
  DEF --> DPM
  DEF --> BLADES
```

Component wiring cannot live in shared code, so exactly three thin client satellite maps exist: `ResourceBladeDefinitionMap` (type-specific blades), `PortableFormatMap` (import/export formats), and `ViewComponentMap` (public view renderers). Server-side hooks (publish transform, read transform) are passed at router construction because they import server code.

## Procedures

One factory, `createResourceProcedures(type, options?)` (`server/trpc/procedure/resource/createResourceProcedures.ts`), spread into each type's router. Content schema and container come from `ResourceDefinitionMap[type]` — callers never pass them. Publish procedures are spread **conditionally with a conditional return type** (guarded by `hasCapability(type, "publishable")` at runtime), so a non-publishable type's router has no publish endpoints at the type level — a compile error on the client `$trpc` type, a 404 on the wire. The options argument itself is a conditional tuple: publish hooks are only accepted when `TType extends PublishableResourceType`.

| Procedure                                                                                            | Auth                                                               | Purpose                                                        |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------- |
| `createResource`                                                                                     | authed                                                             | metadata row; content blob written on first save               |
| `readResources`                                                                                      | authed                                                             | per-type offset-paginated list, publication state joined along |
| `updateResource`                                                                                     | owner                                                              | rename                                                         |
| `deleteResource`                                                                                     | owner                                                              | row + `{id}/` blob directory                                   |
| `readResourceContent` / `saveResourceContent`                                                        | owner                                                              | blob read/write with `contentVersion` check                    |
| `publishResource` / `unpublishResource` / `readResourcePublication` / `readPublishedResourceContent` | see [/docs/architecture/publishing](/docs/architecture/publishing) | Publishable types only                                         |

`saveResourceContent` bumps `contentVersion` and writes the blob in one transaction — the version check is part of the `UPDATE`'s `WHERE`, so concurrent saves cannot both pass and silently lose a write, and a failed blob upload rolls the version back.

Two optional hooks, both proven by Survey: `transformPublishedContent(ctx, resource, content)` (rewrite content at publish time with owner authority — Dashboard bakes dataset snapshots, Survey clones asset blobs into the publish directory) and `transformReadContent(ctx, resource, content)` (rewrite on owner read — Survey refreshes SAS asset URLs).

Ownership middleware: `getOwnerProcedure(type, schema, resourceIdKey)` in `server/trpc/procedure/resource/`, querying `resources` and exposing `ctx.resource`; a typeless overload (`type: undefined`) backs the cross-type `resource.readResource`.

### Router topology

Router-per-type plus one thin cross-type router:

| Router                                                           | Contents                                                                                                                                                                             |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `resource`                                                       | `readResource` (single row by id, cross-type), `readResources` (explorer list, all types), `count` (filtered total, shares its filter schema with the list so they stay in lockstep) |
| `file`, `todoList`, `dashboard`, `email`, `webpage`, `flowchart` | `createResourceProcedures(type, …)`                                                                                                                                                  |
| `survey`                                                         | factory + type-specific procedures (responses, SAS file uploads)                                                                                                                     |

Router-per-type is load-bearing, not cosmetic: achievement `triggerPath`s key off the literal tRPC path (`"flowchart.saveResourceContent"`), and type-specific procedures need a home.

## Client

- **Explorer** (`/resources`) is an Azure-portal-style shell: a Home landing (search + quick-create tiles + recent resources), a full list at `/resources/all`, and a route-driven create flow (`/resources/create` gallery → `/resources/create/[type]` form). Home and `/resources/all` read through the shared `useReadResources` composable (`resource.count` + `resource.readResources`, different sort/limit/filter per surface). Resource pages live at `/resources/[id]/[[blade]]`.
- **`useResource(id)`** (`app/composables/resource/useResource.ts`) loads the row (`resource.readResource`) + typed content (`{type}.readResourceContent`) and exposes `save` (optimistic `contentVersion`), `rename`, `remove`, and capability actions (`publish`/`unpublish`, no-ops for non-publishable types).
- Resource pages are auth-gated. There is no unauthenticated/localStorage editing path — one persistence mechanism, not two.

## Key files

| File                                                                      | Role                                       |
| ------------------------------------------------------------------------- | ------------------------------------------ |
| `packages/db-schema/src/schema/resources.ts`                              | identity table                             |
| `packages/db-schema/src/schema/resourcePublications.ts`                   | publish state table                        |
| `packages/app/shared/services/resource/ResourceDefinitionMap.ts`          | type definitions + capability declarations |
| `packages/app/shared/models/resource/CapabilityResourceType.ts`           | derived capability unions                  |
| `packages/app/shared/services/resource/hasCapability.ts`                  | runtime capability guard                   |
| `packages/app/server/trpc/procedure/resource/createResourceProcedures.ts` | the procedure factory                      |
| `packages/app/server/trpc/procedure/resource/getOwnerProcedure.ts`        | ownership middleware                       |
| `packages/app/app/composables/resource/useResource.ts`                    | client resource lifecycle composable       |
| `packages/app/app/services/resource/ResourceBladeDefinitionMap.ts`        | type-specific blades                       |
| `packages/app/app/services/resource/ViewComponentMap.ts`                  | public view renderers (Publishable)        |
| `packages/app/app/services/resource/PortableFormatMap.ts`                 | import/export formats (Portable)           |
