# Queue and Boundary Payloads — Validate, Never Cast

Read when untyped runtime data enters the program and something is about to be assumed about its shape.

Runtime data crossing any trust boundary — queue messages, webhook bodies, **subprocess stdout, and committed config files** — is untyped. **Never** assert with `x as unknown as SomeType` or hand-roll type guards + casts (`as Record<string, unknown>`, `Object.values(E) as string[]`); a malformed payload then throws deep in the handler instead of at the edge. Define a co-located Zod schema and `.parse()` at the boundary.

For untrusted JSON that arrives as a string (subprocess output, file contents), parse + validate in **one** `getResult`/`getResultAsync` and wrap the failure in `InvalidOperationError(Operation.Read, fn.name, …)` so malformed JSON and a schema mismatch surface identically at the call site. Use `z.strictObject` for closed configs so an unknown key (a typo) fails loud rather than being silently stripped.

```ts
// The schema is co-located with its interface and composed from the published select schema, never restated
export interface WebhookQueueMessage {
  payload: WebhookPayload;
  webhook: Pick<WebhookInMessage, "roomId" | "userId">;
}

export const webhookQueueMessageSchema = z.object({
  payload: webhookPayloadSchema,
  webhook: selectWebhookInMessageSchema.pick({ roomId: true, userId: true }),
}) satisfies z.ZodType<WebhookQueueMessage>;
```

Rules:

- **Co-locate the schema with the interface** — `webhookQueueMessageSchema` in the same file as `WebhookQueueMessage`, `satisfies z.ZodType<TheInterface>` (`packages/db-schema/src/models/queue/WebhookQueueMessage.ts`). After adding a `@esposter/db-schema` file, run `pnpm build` there so the generated barrel carries it.
- **Compose from existing schemas** — `.pick()` from the existing entity/select schema and reuse the published payload schema. Never hand-rewrite existing field validators.
- **`.parse()` is the first line of the queue handler** — `apps/functions/src/handlers/processNotificationHandler.ts` parses its body before anything else, and its comment names the throw as the queue's retry request. Let the parsed value's inferred type flow downstream — drop the redundant `import type` of the message interface.
- **Parse a value once, at its door, and pass the result down.** A second `.parse` of the same input is either a view the first schema could have kept (a loose envelope retains the keys a strict one strips, so one parse serves a replay that republishes five fields and rejects the whole message) or a different value (a transform's output, a clone's rewrite), which the door parses because it is the door. A second pass over the same value stays only with a comment naming what the first could not carry. Nothing enforces it: it is dataflow, the same value reaching two parses, which no syntactic rule sees without flagging the second pass of a value that changed.
- **`.nullish()` is allowed here** — the `absent-values` skill's `.nullable()` ban does not reach an external boundary's own shape. An external payload's optional fields can arrive as `null` or absent, so `z.string().nullish()` is correct.
- When the schema is an exported const in a `packages/*` library, it also needs an explicit type annotation — `references/isolated-declarations.md`.
