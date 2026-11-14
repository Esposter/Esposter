// @vitest-environment nuxt
import type { ResourceActivityInResource } from "@esposter/db-schema";

import ResourceActivityLogListItem from "@/components/Resource/ActivityLogListItem.vue";
import { ResourceActivityType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("resourceActivityLogListItem", () => {
  // An agent writes as the owner from a key of its own, and the row names that key, so the edit reads as the agent's
  test("an assistant edit is recorded under the person's key", async () => {
    expect.hasAssertions();

    const name = "Assistant";
    const activity: ResourceActivityInResource = {
      activityType: ResourceActivityType.ContentSaved,
      apiKeyId: v7(),
      apiKeyName: name,
      createdAt: new Date(0),
      deletedAt: null,
      id: v7(),
      newName: null,
      oldName: null,
      publishVersion: null,
      resourceId: v7(),
      updatedAt: new Date(0),
      userId: v7(),
    };
    const component = await mountSuspended(ResourceActivityLogListItem, { props: { activity } });

    expect(component.text()).toContain(`Through the API key "${name}"`);
  });
});
