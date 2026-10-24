import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { STARTER_EMAIL_SOURCE } from "#shared/services/pageBuilder/email/starterEmailSource";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { parseMjmlDocument } from "mjml-blocks";
import { describe, expect, test } from "vitest";

describe(emailKind, () => {
  test("the email kind's schema accepts the starter email read back through its registry", () => {
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

    expect(emailKind.documentSchema.safeParse(result.data).success).toBe(true);
  });
});
