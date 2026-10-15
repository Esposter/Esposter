import type { FileEntity } from "#src/models/azure/table/FileEntity";

import { fileEntitySchema } from "#src/models/azure/table/FileEntity";
import { refineMessageSchema } from "#src/services/message/refineMessageSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(refineMessageSchema, () => {
  const message = "message";
  const filename = "filename";
  const mimetype = "mimetype";
  const files: FileEntity[] = [];

  test("refines", () => {
    expect.hasAssertions();

    const schema = refineMessageSchema(
      z.object({ files: fileEntitySchema.array().optional(), message: z.string().optional() }),
    );

    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ message }).success).toBe(true);
    expect(schema.safeParse({ files }).success).toBe(true);
    expect(schema.safeParse({ files, message }).success).toBe(true);
  });

  test("reads older attachments without a spoiler flag as unspoiled", () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();

    expect(fileEntitySchema.parse({ filename, id, mimetype, size: 1 })).toStrictEqual({
      filename,
      hasThumbnail: false,
      id,
      isSpoiler: false,
      mimetype,
      size: 1,
    });
  });
});
