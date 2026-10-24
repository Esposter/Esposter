import { TEST_ORIGIN } from "#shared/services/pageBuilder/constants.test";
import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { STARTER_EMAIL_SOURCE } from "#shared/services/pageBuilder/email/starterEmailSource";
import { parseMjmlDocument } from "mjml-blocks";
import { describe, expect, test } from "vitest";

import { compileEmailDocument } from "./compileEmailDocument";

describe("starterEmail", () => {
  test("the starter reads back as a valid email that compiles under strict validation", async () => {
    expect.hasAssertions();

    const result = parseMjmlDocument(
      STARTER_EMAIL_SOURCE,
      emailRegistry,
      emailBodyChildrenSchema,
      noteRichText,
      MAX_EMAIL_NODES,
    );
    expect(result.success).toBe(true);
    if (!result.success) return;

    await compileEmailDocument(result.data, { origin: TEST_ORIGIN }).match(
      (html) => {
        expect(html).toContain("Welcome aboard");
      },
      (error) => {
        throw error;
      },
    );
  });
});
