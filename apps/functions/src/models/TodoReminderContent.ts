import { z } from "zod";

// A minimal projection of the TodoList content blob — the item fields the reminder needs to verify
// (deleted/re-dated) and render its push. The full content schema lives in the app (#shared) which
// Azure Functions cannot import, so this parses only what it needs and drops everything else.
// The due date is coerced because the blob is read back with plain JSON.parse (an ISO string, not a Date).
export const todoReminderContentSchema: z.ZodObject<{
  items: z.ZodArray<
    z.ZodObject<{
      dueAt: z.ZodNullable<z.ZodCoercedDate>;
      id: z.ZodUUID;
      name: z.ZodString;
    }>
  >;
}> = z.object({
  items: z.array(
    z.object({
      dueAt: z.coerce.date().nullable(),
      id: z.uuid(),
      name: z.string(),
    }),
  ),
});
export type TodoReminderContent = z.infer<typeof todoReminderContentSchema>;
