# Serialization — Architecture

How class instances (e.g. `StandardMessageEntity`) are serialized and deserialized across all three
paths in the app: Azure Table read, SSR payload hydration, and tRPC transport.

---

## The Three Paths

Each path is independent. They do not compose or run in sequence.

```text
Azure Table read (server-side only)
──────────────────────────────────────────────────────────────────
Azure SDK row
  ├─ date columns   → already Date objects  ──────────────────┐
  └─ JSON columns   → string                                   │
       │                                                       │
  deserializeEntity.ts                                         │
  jsonDateParse(String(value))          class instance (Date) ◄┘
  → nested dates restored                → createdAt: Date ✓

SSR / Nuxt payload (page load)
──────────────────────────────────────────────────────────────────
Server                                   Client
  Pinia state (Date objects)
       │
  customPayloads.ts reducer               HTML payload
  JSON.stringify(entity)    ───────────►  customPayloads.ts reviver
  → createdAt: string                     new cls(jsonDateParse(data))
                                          → createdAt: Date, instanceof cls ✓

tRPC transport (query / mutation / subscription)
──────────────────────────────────────────────────────────────────
Server                                   Client
  class instance (Date objects)
       │
  transformer.ts (SuperJSON)             HTTP or WebSocket
  registerCustom serialize(entity)  ──►  registerCustom deserialize(data)
  JSON.stringify(entity)                 new cls(jsonDateParse(data))
  → createdAt: string                    → createdAt: Date, instanceof cls ✓
```

---

## Why `jsonDateParse` Is Needed on the Transport Paths

`StandardMessageEntity` (and all classes in `JSONClassMap`) extend `Serializable`, which defines:

```typescript
toJSON(): this {
  return structuredClone(toRawDeep(this));
}
```

`JSON.stringify(entity)` calls `toJSON()` first, producing a plain-object clone. `JSON.stringify`
then converts any `Date` fields in that clone to ISO strings. By the time the transport layer sees
the bytes, the type metadata is gone.

Both the SSR and tRPC paths fix this by passing the raw JSON string through `jsonDateParse` during
revival, which re-applies ISO date → `Date` conversion via its JSON reviver. The reviver also
reconstructs the class instance (`new cls(...)`) so the result is a proper typed instance —
preserving `instanceof` checks and class methods — not a plain object.

---

## Implementation

### Azure Table path — `packages/db/src/services/azure/transformer/deserializeEntity.ts`

Runs server-side only, before any transport. The Azure SDK already returns `Date` objects for
columns stored as `Edm.DateTime`. For columns stored as JSON strings (arrays, nested objects),
`getIsSerializable` detects them and `jsonDateParse` restores any dates inside.

```typescript
const instance = new cls(); // restores class identity
for (const [property, value] of Object.entries(entity))
  if (!(value instanceof Date) && getIsSerializable(instance[property]))
    instance[property] = jsonDateParse(String(value)); // JSON column → parse + restore dates
  else instance[property] = value; // date column → already a Date
```

`getIsSerializable` returns `true` for arrays and non-Date objects — i.e. properties that were
stored in Azure Table as a JSON string (e.g. `files: FileEntity[]`, `mentions: string[]`).

### SSR path — `packages/app/app/plugins/customPayloads.ts`

Registered with Nuxt's payload plugin API. Fires for any class instance in Pinia state or
`useAsyncData` that Nuxt serializes into the HTML payload for client hydration.

```typescript
definePayloadReducer(name, (data) => data instanceof cls && JSON.stringify(data));
definePayloadReviver(name, (data) => new cls(jsonDateParse(data)));
```

### tRPC path — `packages/app/shared/services/trpc/transformer.ts`

Used as the SuperJSON transformer for all tRPC HTTP batch links and WebSocket links. `registerClass`
alone does not call `jsonDateParse` on revival, so `registerCustom` is used instead.

```typescript
SuperJSON.registerCustom(
  {
    isApplicable: (value): value is InstanceType<typeof cls> => value instanceof cls,
    serialize: (value) => JSON.stringify(value),
    deserialize: (data) => new cls(jsonDateParse(data as string)),
  },
  name,
);
```

---

## Class Registry

All three transport paths share the same source of truth:
`packages/app/shared/services/superjson/JSONClassMap.ts`.

Adding a new serializable class requires a single entry in that map. The SSR and tRPC paths pick it
up automatically. The Azure Table path uses `MessageEntityMap` (in `@esposter/db-schema`) to select
the correct concrete class per `type` discriminant — new message entity types must be registered
there separately.

---

## What Does Not Apply Here

- **Plain objects / tRPC primitives**: SuperJSON handles these natively without class registration.
