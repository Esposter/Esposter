// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceBlueprintEditor from "@/components/Resource/Blueprint/Editor.vue";
import { createEmptyBlueprint } from "@/services/resource/blueprint/createEmptyBlueprint";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe("resourceBlueprintEditor", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({
      ...createResourceListItem({ id: resourceId, type: ResourceType.Blueprint }),
      publication: null,
    }));
    trpcMsw.blueprint.readResourceContent.query(() => createEmptyBlueprint());
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
  });

  // A deploy runs the saved manifest, so while the text on screen differs from it the deploy would run something
  // Other than what the owner is looking at
  test("keeps Deploy from running while the manifest has unsaved edits", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceBlueprintEditor);
    const findDeployButton = () => component.findAll("button").find((button) => button.text() === "Deploy");
    const deployButton = findDeployButton();
    assert.exists(deployButton);

    expect(deployButton.attributes("disabled")).toBeUndefined();

    await component.get("textarea").setValue("{}");
    const dirtyDeployButton = findDeployButton();
    assert.exists(dirtyDeployButton);

    expect(dirtyDeployButton.attributes("disabled")).toBeDefined();
  });
});
