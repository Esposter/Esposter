---
title: Platform
description: The cross-product layer model — identity, resources, datasets, publishing, and events — that links Esposter's products together.
---

# Platform — Cross-Product Layer Model

How Esposter's products link together. Five layers; the Resources layer carries the products, and the others are capabilities or infrastructure it plugs into.

## Principle

> **Everything is a resource; capabilities are opt-in.** A resource exposes and consumes **datasets** if it declares so. Anything publishable gets a **public versioned read**. Every mutation is already an **achievement trigger**.

New products join the platform by adding one `ResourceType` and one `ResourceDefinitionMap` entry, not by adding services or bespoke pages. Games, anime, and the fluid simulator deliberately stay outside (achievements only) — a game save has nothing to gain from naming, sharing, or dataset semantics.

## Layer model

| Layer          | Contract                                                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Identity**   | `users.id` (Better-Auth) keys every row, blob path, and session — shared by all products                                                  |
| **Resources**  | Postgres identity row + content blob + capability declaration → [/docs/architecture/resources](/docs/architecture/resources)              |
| **Datasets**   | Columns + rows served by DatasetProvider types → [/docs/architecture/datasets](/docs/architecture/datasets)                               |
| **Publishing** | Versioned publish copy + public rate-limited read at `/view/[type]/[id]` → [/docs/architecture/publishing](/docs/architecture/publishing) |
| **Events**     | tRPC mutation path = achievement trigger key (`achievementPlugin`) — every new procedure is automatically triggerable                     |

```mermaid
flowchart TB
  subgraph explorer [Resource Explorer — /resources]
    SHEET[Sheet<br/>datasetProvider · portable]
    SURVEY[Survey<br/>publishable · datasetProvider]
    TODO[TodoList]
    DASH[Dashboard<br/>publishable]
    EMAIL[Email<br/>portable]
    WEB[Webpage<br/>publishable]
    FLOW[Flowchart]
  end

  subgraph platform [Platform layers]
    RES["Resources<br/>identity row + content blob + ResourceDefinitionMap"]
    DS["Datasets<br/>readDataset(reference) + provider map"]
    PUB["Publishing<br/>snapshot + public /view/[type]/[id]"]
  end

  explorer --- RES
  SHEET -- Sheet provider --> DS
  SURVEY -- SurveyResponses provider --> DS
  DS -- bind / import / merge fields --> DASH
  DS --> SHEET
  DS --> EMAIL
  SURVEY --> PUB
  DASH --> PUB
  WEB --> PUB
  PUB -- "public /view URLs (shareable in esbabbler)" --> WORLD((Viewers))

  ACH[Achievements<br/>tRPC path middleware]
  ID[(Identity<br/>Better-Auth users.id)]
  platform --- ID
  explorer -. every mutation .-> ACH
```

## Business-logic user journey

The headline cross-product flow — **create a survey → collect responses → extract/transform → visualise → publish** — runs entirely through resources and their capabilities:

```mermaid
sequenceDiagram
  actor Creator
  actor Respondent
  participant SV as Survey resource<br/>(Editor blade)
  participant AT as Azure Table<br/>(SurveyResponses)
  participant SH as Sheet resource<br/>(Data blade)
  participant DB as Dashboard resource
  participant PUB as Public /view/[type]/[id]

  Creator->>SV: 1. Author survey (SurveyJS autosave → saveResourceContent)
  Creator->>SV: 2. Publish — snapshot model + assets to {id}/published/{n}
  PUB-->>Respondent: 3. Share /view/survey/{id} (esbabbler, email block, anywhere)
  Respondent->>AT: 4. Respond → rows (partitionKey = survey resource id)
  Note over SV,AT: Respondents are served the published snapshot — unpublished 404s
  Creator->>SH: 5. Import responses (dataset.readDataset → one-time copy into a Sheet resource)
  SH->>SH: 6. Computed columns — Aggregation / Math / Regex / String
  Creator->>DB: 7. Bind visual to a DatasetReference (live re-resolve on load)
  DB->>PUB: 8. Publish dashboard — bakes dataset snapshots → shareable /view/dashboard/{id}
```

## Capability matrix

`ResourceDefinitionMap` ([/docs/architecture/resources](/docs/architecture/resources)) is the authoritative declaration; this is the summary:

| ResourceType | Publishable | DatasetProvider | Portable  | Blades beyond Overview/Editor |
| ------------ | :---------: | :-------------: | :-------: | ----------------------------- |
| Dashboard    |     ✅      |                 |           |                               |
| Email        |             |                 | ✅ export |                               |
| Flowchart    |             |                 |           |                               |
| Sheet        |             |       ✅        |    ✅     | Data, Settings                |
| Survey       |     ✅      |  ✅ responses   |           | Responses                     |
| TodoList     |             |                 |           | Items, Calendar               |
| Webpage      |     ✅      |                 |           |                               |

Outside the resource model: **Posts** (relational Postgres, social feed semantics), **Esbabbler** (distribution channel for published links), **Achievements** (the events layer itself), and **games/anime/fluid** (blob save state or none; achievements only). Single-blob-per-user save state (`useSave`, blob `${userId}/save`) remains only for genuinely one-per-user saves: clicker and dungeons.
