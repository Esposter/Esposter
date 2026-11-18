// @vitest-environment nuxt
import MessageContentHeaderOverflowMenu from "#src/components/Message/Content/Header/OverflowMenu.vue";
import UiOverflowMenu from "#src/components/Ui/OverflowMenu.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Whether the window is a phone's is read from the display composable, so a test says how wide it is before it mounts
const display = vi.hoisted(() => ({ smAndUp: true }));
vi.mock(import("#src/composables/ui/useUiDisplay"), async (importOriginal) => {
  const actual = await importOriginal();

  return { ...actual, useUiDisplay: () => ({ ...actual.useUiDisplay(), smAndUp: shallowRef(display.smAndUp) }) };
});

describe("messageContentHeaderOverflowMenu", () => {
  beforeEach(() => {
    display.smAndUp = true;
  });

  test("from sm up, the menu leaves the call and the toggles to the header", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageContentHeaderOverflowMenu);
    const [firstItem] = component.findComponent(UiOverflowMenu).props("items");

    expect(firstItem?.title).toBe("Pinned Messages");
  });

  test("a phone's menu carries the header's toggles as rows", async () => {
    expect.hasAssertions();

    display.smAndUp = false;
    const component = await mountSuspended(MessageContentHeaderOverflowMenu);
    const items = component.findComponent(UiOverflowMenu).props("items");

    expect(
      items.slice(0, 5).map(({ isChecked, isGroupStart, title }) => ({ isChecked, isGroupStart, title })),
    ).toStrictEqual([
      { isChecked: undefined, isGroupStart: undefined, title: "Start Call" },
      { isChecked: false, isGroupStart: undefined, title: "Followed Threads" },
      { isChecked: false, isGroupStart: undefined, title: "Search" },
      { isChecked: false, isGroupStart: undefined, title: "Member List" },
      { isChecked: undefined, isGroupStart: true, title: "Pinned Messages" },
    ]);
  });
});
