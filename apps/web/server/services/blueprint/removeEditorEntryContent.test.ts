import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";

import { removeEditorEntryContent } from "#server/services/blueprint/removeEditorEntryContent";
import { ResourceType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(removeEditorEntryContent, () => {
  // GrapesJS project data, the shape the cutover retires
  const editorContent = { pages: [] };

  test("drops the content of webpage and email entries, and walks a captured Blueprint's manifest", () => {
    expect.hasAssertions();

    const nestedManifest: BlueprintResource = {
      entries: [{ content: editorContent, key: "a", name: "a", type: ResourceType.Email }],
      parameters: [],
    };
    const manifest: BlueprintResource = {
      entries: [
        { content: editorContent, key: "a", name: "a", type: ResourceType.Webpage },
        { content: nestedManifest, key: "b", name: "b", type: ResourceType.Blueprint },
        { content: {}, key: "c", name: "c", type: ResourceType.Program },
      ],
      parameters: [],
    };

    expect(removeEditorEntryContent(manifest)).toStrictEqual({
      entries: [
        { key: "a", name: "a", type: ResourceType.Webpage },
        {
          content: { entries: [{ key: "a", name: "a", type: ResourceType.Email }], parameters: [] },
          key: "b",
          name: "b",
          type: ResourceType.Blueprint,
        },
        { content: {}, key: "c", name: "c", type: ResourceType.Program },
      ],
      parameters: [],
    });
  });
});
