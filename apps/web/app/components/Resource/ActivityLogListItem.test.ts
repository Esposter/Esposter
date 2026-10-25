// @vitest-environment nuxt
import ResourceActivityLogListItem from "@/components/Resource/ActivityLogListItem.vue";
import { getReverseTickedTimestamp, ResourceActivityEntity, ResourceActivityType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceActivityLogListItem", () => {
  // An agent writes as the owner from a key of its own, and the row names that key, so the edit reads as the agent's
  test("an assistant edit is recorded under the person's key", async () => {
    expect.hasAssertions();

    const name = "Assistant";
    const component = await mountSuspended(ResourceActivityLogListItem, {
      props: {
        activity: new ResourceActivityEntity({
          activityType: ResourceActivityType.ContentSaved,
          apiKeyName: name,
          createdAt: new Date(0),
          partitionKey: crypto.randomUUID(),
          rowKey: getReverseTickedTimestamp(),
        }),
      },
    });

    expect(component.text()).toContain(`Through the API key "${name}"`);
  });
});
