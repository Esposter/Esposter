import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WEBPAGE_PLACEABLE_NODE_TYPES } from "#shared/services/pageBuilder/constants";
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { webpageNodeTypeDefinitionMap } from "#shared/services/pageBuilder/webpageNodeTypeDefinitionMap";
import { createWebpageNode } from "@/services/pageBuilder/webpageNodeDefaults";
import { describe, expect, test } from "vitest";

describe(createWebpageNode, () => {
  test("every webpage type has a default that its own props schema accepts", () => {
    expect.hasAssertions();

    for (const type of [...WEBPAGE_PLACEABLE_NODE_TYPES, WebpageNodeType.Column, WebpageNodeType.Tab]) {
      const { propsSchema } = webpageNodeTypeDefinitionMap[type];

      expect(propsSchema.safeParse(createWebpageNode(type, TEST_ID).props).success).toBe(true);
    }
  });
});
