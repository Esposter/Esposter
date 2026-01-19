import type { FileEntity } from "@/models/azure/table/FileEntity";

import { refineMessageSchema } from "@/services/message/refineMessageSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(refineMessageSchema, () => {
  const message = "message";
  const files: FileEntity[] = [];

  test("refines", () => {
    expect.hasAssertions();

    const schema = refineMessageSchema(
      z.object({
        files: z
          .object({
            filename: z.string(),
            id: z.string(),
            mimetype: z.string(),
            size: z.number(),
          })
          .array()
          .optional(),
        message: z.string().optional(),
      }),
    );

    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ message }).success).toBe(true);
    expect(schema.safeParse({ files }).success).toBe(true);
    expect(schema.safeParse({ files, message }).success).toBe(true);
  });
});
