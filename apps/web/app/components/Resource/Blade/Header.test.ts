// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import ResourceBladeHeader from "@/components/Resource/Blade/Header.vue";
import { useCommandStore } from "@/store/ui/command";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceBladeHeader", () => {
  // Every type's blade shares this header, so Ask Claude is offered in every type's editor, in the toolbar and the palette
  test.each(Object.values(ResourceType))("ask Claude is available in the %s editor", async (type) => {
    expect.hasAssertions();

    const group = ResourceDefinitionMap[type].title;
    const component = await mountSuspended(ResourceBladeHeader, {
      props: { resource: createResourceListItem({ type }) },
    });

    expect(component.find('[aria-label="Ask Claude"]').exists()).toBe(true);
    // The palette keeps the commands of every header mounted before this one, so this type's group is what is read
    const commandStore = useCommandStore();

    expect(
      commandStore.commands
        .filter((command) => command.id === "ask-claude" && command.group === group)
        .map(({ title }) => title),
    ).toStrictEqual(["Ask Claude"]);
  });
});
