# Tasks

This program's work is its four changes, in order. Each change's own tasks name how each step is verified, and none is started until the change before it has shipped.

## 1. Declaration

- [ ] 1.1 Build the tags change: [architecture-derived-fields-tags](../architecture-derived-fields-tags/tasks.md). Built first, since every later change reads its declarations.

## 2. Relations

- [ ] 2.1 Build the server half of the relations: [architecture-derived-fields-relations-server](../architecture-derived-fields-relations-server/tasks.md). Built on the declarations, and before any client change, since the client reads the answers it gives.
- [ ] 2.2 Build the client half of the relations: [architecture-derived-fields-relations-client](../architecture-derived-fields-relations-client/tasks.md). Built on the answers, and retires the count lint selectors in the same change.

## 3. Counters

- [ ] 3.1 Build the counters: [architecture-derived-fields-counters](../architecture-derived-fields-counters/tasks.md). Built last, on the helpers the relations changes add.

## 4. Closing

- [ ] 4.1 Archive each change as it ships, and rewrite the capability design as built in `specs/architecture/derived-fields`. Verified by `pnpm exec openspec archive <id> --yes` succeeding for each change in turn.
