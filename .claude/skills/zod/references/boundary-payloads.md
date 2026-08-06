# External Event / Boundary Payloads — Validate, Never Cast

Runtime data crossing any trust boundary — EventGrid `event.data`, Storage Queue messages, webhook bodies, **subprocess stdout, and committed config files** — is untyped. **Never** assert with `x as unknown as SomeType` or hand-roll type guards + casts (`as Record<string, unknown>`, `Object.values(E) as string[]`); a malformed payload then throws deep in the handler instead of at the edge. Define a co-located Zod schema and `.parse()` at the boundary.

For untrusted JSON that arrives as a string (subprocess output, file contents), parse + validate in **one** `getResult`/`getResultAsync` and wrap the failure in `InvalidOperationError(Operation.Read, fn.name, …)` so malformed JSON and a schema mismatch surface identically at the call site — canonical refs: `virrun/src/services/exec/snapshot/parseOverlayManifest.ts` (process stdout) and `virrun/src/services/configuration/parseVirrunConfiguration.ts` (config file). Use `z.strictObject` for closed configs so an unknown key (a typo) fails loud rather than being silently stripped.

```typescript
// schema co-located next to the interface, parsed at the boundary — never `event.data as unknown as T`
export interface PushNotificationEventGridData {
  message: Pick<MessageEntity, "message" | "partitionKey" | "rowKey" | "userId">;
  notificationOptions: { icon?: null | string; title?: null | string };
}
export const pushNotificationEventGridDataSchema = z.object({
  message: standardMessageEntitySchema.pick({ message: true, partitionKey: true, rowKey: true, userId: true }),
  notificationOptions: z.object({ icon: z.string().nullish(), title: z.string().nullish() }),
}) satisfies z.ZodType<PushNotificationEventGridData>;
```

Rules:

- **Co-locate the schema with the interface** — `*EventGridDataSchema` in the same file as `*EventGridData`, `satisfies z.ZodType<TheInterface>`. After adding an export to a `@esposter/db-schema` file, run `pnpm export:gen` (barrel) and `pnpm build` (so dependents like `azure-functions` resolve it from `dist`).
- **Compose from existing schemas** — `.pick()` from `standardMessageEntitySchema` / `selectWebhookInMessageSchema`, reuse `webhookPayloadSchema`. Never hand-rewrite existing field validators.
- **`.parse()` as the first line inside `getResultAsync(async () => { ... })`** (matching `processScheduledMessageJobHandler`) so a validation failure flows through the handler's fatal `logAndRethrow` path (see the **error-handling** skill's Azure Functions section) instead of throwing synchronously outside it. Let the parsed value's inferred type flow downstream — drop the redundant `import type { *EventGridData }`.
- **`.nullish()` is allowed here** — the app-owned `.nullable()` ban doesn't apply at the external boundary. EventGrid `notificationOptions` fields are `null | string`, so `z.string().nullish()` is correct.
- When the schema is an exported const in a `packages/*` library, it also needs an explicit type annotation — `references/isolated-declarations.md`.
