import { z } from "zod";

// A minimal projection of the TodoList content blob, holding the fields a reminder checks an item against (deleted, re-dated or completed).
// The reminder renders its push from the same fields. The full content schema lives in the web app, which the Workers cannot import.
// So this parses only what the realtime and jobs Workers need. The due date is coerced because the blob is read back with plain JSON.parse.
// That yields an ISO string rather than a Date.
export const todoReminderContentSchema: z.ZodObject<{
  items: z.ZodArray<
    z.ZodObject<{
      completedAt: z.ZodOptional<z.ZodCoercedDate>;
      dueAt: z.ZodOptional<z.ZodCoercedDate>;
      id: z.ZodUUID;
      name: z.ZodString;
    }>
  >;
}> = z.object({
  items: z.array(
    z.object({
      completedAt: z.coerce.date().optional(),
      dueAt: z.coerce.date().optional(),
      id: z.uuidv7(),
      name: z.string(),
    }),
  ),
});
export type TodoReminderContent = z.infer<typeof todoReminderContentSchema>;
