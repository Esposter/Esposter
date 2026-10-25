import { EMAIL_NODE_TYPE_TITLE_MAP } from "#shared/services/pageBuilder/email/constants";
import { createEmailNode } from "#shared/services/pageBuilder/email/createEmailNode";
import { emailNodeSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { describe, expect, test } from "vitest";

describe(createEmailNode, () => {
  test.each(Object.keys(EMAIL_NODE_TYPE_TITLE_MAP))("a fresh %s parses under the email node schema", (type) => {
    expect.hasAssertions();
    const node = createEmailNode(type as Parameters<typeof createEmailNode>[0], "node-id");

    expect(emailNodeSchema.safeParse(node).success).toBe(true);
    expect(node.type).toBe(type);
    expect(node.props.id).toBe("node-id");
  });
});
