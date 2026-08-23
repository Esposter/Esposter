import type { FileEntity } from "#src/models/azure/table/FileEntity";

import { fileEntitySchema } from "#src/models/azure/table/FileEntity";
import { refineMessageSchema } from "#src/services/message/refineMessageSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(refineMessageSchema, () => {
  const message = "message";
  const files: FileEntity[] = [];

  test("refines", () => {
    expect.hasAssertions();

    const schema = refineMessageSchema(
      z.object({
        files: fileEntitySchema.array().optional(),
        message: z.string().optional(),
      }),
    );

    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ message }).success).toBe(true);
    expect(schema.safeParse({ files }).success).toBe(true);
    expect(schema.safeParse({ files, message }).success).toBe(true);
  });
});
