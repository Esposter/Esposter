# Persisted Data — Latest Shape Only

Schemas, constructors, and read paths for persisted data (save blobs, localStorage state, any client-authoritative payload) always model **only the latest, cleanest shape**. No legacy union arms, no `.default()`s papering over fields older data lacks, no constructor code migrating old layouts, no per-element tolerance filters that let stale data limp through.

## The rule

- One schema per entity, describing exactly what the code writes today.
- Data that fails to parse resets to a fresh default only where the browser is its only copy: a guest's clicker save starts a new `Clicker`, and a guest's dungeons save starts a new `Dungeons` (`toLocalDungeons`). The reset **is** the migration for that state. A blob stored server-side is backfilled to the new shape instead (the `backfills` skill), and a read of one that fails is an error, never a reset: no fresh default is answered, so the save the client sends next cannot overwrite the one the server holds. No one's save resets because a schema moved. The Genshin save is the exception to the reset: its blob is the player's only copy, so one that no longer parses is answered as an error and left as it is ([save data](../../genshin/save-data/design.md)).
- When a shape changes, change the schema and delete the old shape in the same commit — never ship a union of old + new or a read-side transform.

## Why

Migration code is permanent cost for a temporary population: it doubles the schema surface, needs its own tests, and rots the moment the next shape change lands on top of it. For casual client-authoritative state (game saves, drafts, UI state), losing pre-change data is an acceptable trade for a codebase that only ever describes one shape.

## Scope

This governs app-code-owned persisted state: client-authoritative blobs and localStorage state. Relational data in Postgres migrates through real Drizzle migrations (`pnpm db:gen`) — that is schema evolution of a server-owned store, not a legacy-shape read path, and is unaffected by this rule.

Azure Table entities follow the rule too, despite being server-owned: Table Storage is schemaless, so a field an entity class gains reads back as absent for every row written before it. **A field added to an entity is a fact about rows written from now on.** Where the earlier rows matter — a nested JSON property, or a value a consumer requires — they are backfilled by the one-off script of the `backfills` skill, and the schema requires the field. A `.default()` that stays on an entity is one whose absence a current writer produces: a property with no value is stored as no property, while an empty string or array is stored as written, so a field every current writer sets leaves no absence for its default to cover, and the schema says so beside it. A default that is the creation value of a schema serving as its own factory (a form's or a node factory's initial values) may stay; it is never added so that older stored data parses — a field added to such a schema is followed by the backfill that writes it.

User resource content (`content.json` blobs) sits between the two. The blob is the **user's** data, so a resource must be self-contained — a duplicate clones every asset its content references, working-copy and published alike ([resource file assets](../../resource/resource-file-assets/design.md)) — and never resets to a fresh default. But the content schema itself is app-owned, so reads still parse latest-shape-only: when app code changes a content schema so that stored content no longer parses, the stored content is backfilled to the new shape in the same change, from outside the app, by a one-off script that leaves nothing in the repo (the `backfills` skill). Version snapshots are not rewritten, so a version taken before the change fails to restore — the accepted cost of code that describes one shape.

## Rejected

- **Accepting absence for earlier rows, with no backfill.** A required field would then fail to parse every row written before it, and a `.default()` kept for it restates that old data in code, the population this rule exists to stop carrying.
- **Committing the backfill script with the change.** The script runs once, so a committed copy is dead code after its run, and it carries a credential path to the live store that the repository should not hold.
