// @vitest-environment nuxt
import MessageContentHeaderOverflowMenu from "#src/components/Message/Content/Header/OverflowMenu.vue";
import UiOverflowMenu from "#src/components/Ui/OverflowMenu.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Whether the drawers dock is read from the display composable, so a test says how wide the window is before it mounts
const display = vi.hoisted(() => ({ isMobile: false }));
vi.mock(import("#src/composables/ui/useUiDisplay"), async (importOriginal) => {
  const actual = await importOriginal();

  return { ...actual, useUiDisplay: () => ({ ...actual.useUiDisplay(), isMobile: shallowRef(display.isMobile) }) };
});

describe("messageContentHeaderOverflowMenu", () => {
  beforeEach(() => {
    display.isMobile = false;
  });

  test("where the drawers dock, the menu leaves the call and the toggles to the header", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageContentHeaderOverflowMenu);
    const [firstItem] = component.findComponent(UiOverflowMenu).props("items");

    expect(firstItem?.title).toBe("Followed Threads");
  });

  test("a phone's menu carries the header's toggles as rows", async () => {
    expect.hasAssertions();

    display.isMobile = true;
    const component = await mountSuspended(MessageContentHeaderOverflowMenu);
    const items = component.findComponent(UiOverflowMenu).props("items");

    expect(
      items.slice(0, 4).map(({ isChecked, isGroupStart, title }) => ({ isChecked, isGroupStart, title })),
    ).toStrictEqual([
      { isChecked: undefined, isGroupStart: undefined, title: "Start Call" },
      { isChecked: false, isGroupStart: undefined, title: "Search" },
      { isChecked: false, isGroupStart: undefined, title: "Member List" },
      { isChecked: undefined, isGroupStart: true, title: "Followed Threads" },
    ]);
  });
});
