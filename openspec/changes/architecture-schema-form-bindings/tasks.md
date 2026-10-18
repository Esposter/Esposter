## 1. The bindings

- [ ] 1.1 Write the scenarios 'Editing a field nested in a list' (#2003) and 'A schema with a node nothing draws' into the schema form's suite first, and see the second fail. Verify: `pnpm test app/components/Ui/SchemaForm --run` from `apps/web` reports it failing.
- [ ] 1.2 Pass `form` down from the root through every renderer, map each renderer's props with the core's functions, and drop the root's `provide`. Verify: the same command passes.
- [ ] 1.3 Remove `@jsonforms/vue` from the app's manifest, the catalog and the ledger, and the JSON Forms exception from the Vue skill's injection rule. Verify: `@jsonforms/vue` appears nowhere in `apps/web`, `.agents` or `pnpm-lock.yaml`.

## 2. The record

- [ ] 2.1 Rewrite the schema forms design as built, with the Upstream table, and archive this change. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/workspace/staleNames.test.ts src/services/openspec` passes.
