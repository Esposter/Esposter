// @vitest-environment nuxt
import MessageContentHeaderOverflowMenu from "#src/components/Message/Content/Header/OverflowMenu.vue";
import UiOverflowMenu from "#src/components/Ui/OverflowMenu.vue";
import { NotificationTypeLabelMap } from "#src/services/message/NotificationTypeLabelMap";
import { NotificationType } from "@esposter/db-schema";
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
    const items = component.findComponent(UiOverflowMenu).props("items");

    expect(items.map(({ title }) => title)).toStrictEqual([
      "Pinned Messages",
      ...Object.values(NotificationType).map((type) => NotificationTypeLabelMap[type]),
    ]);
  });

  test("a phone's menu carries the header's toggles as rows", async () => {
    expect.hasAssertions();

    display.smAndUp = false;
    const component = await mountSuspended(MessageContentHeaderOverflowMenu);
    const items = component.findComponent(UiOverflowMenu).props("items");

    expect(items.map(({ isChecked, isGroupStart, title }) => ({ isChecked, isGroupStart, title }))).toStrictEqual([
      { isChecked: undefined, isGroupStart: undefined, title: "Start Call" },
      { isChecked: false, isGroupStart: undefined, title: "Followed Threads" },
      { isChecked: false, isGroupStart: undefined, title: "Search" },
      { isChecked: false, isGroupStart: undefined, title: "Member List" },
      { isChecked: undefined, isGroupStart: true, title: "Pinned Messages" },
      ...Object.values(NotificationType).map((type, index) => ({
        isChecked: undefined,
        isGroupStart: index === 0,
        title: NotificationTypeLabelMap[type],
      })),
    ]);
  });
});
