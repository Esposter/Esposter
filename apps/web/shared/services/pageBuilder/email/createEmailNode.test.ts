import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import { createEmailNode } from "#shared/services/pageBuilder/email/createEmailNode";
import { emailNodeSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { MjmlNodeType } from "mjml-blocks";
import { describe, expect, test } from "vitest";

describe(createEmailNode, () => {
  test.each([...Object.values(EmailNodeType), ...Object.values(MjmlNodeType)])(
    "a fresh %s parses under the email node schema",
    (type) => {
      expect.hasAssertions();
      const node = createEmailNode(type, "node-id");

      expect(emailNodeSchema.safeParse(node).success).toBe(true);
      expect(node.type).toBe(type);
      expect(node.props.id).toBe("node-id");
    },
  );
});
