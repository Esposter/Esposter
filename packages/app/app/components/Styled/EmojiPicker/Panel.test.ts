// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import StyledEmojiPickerGrid from "@/components/Styled/EmojiPicker/Grid.vue";
import StyledEmojiPickerPanel from "@/components/Styled/EmojiPicker/Panel.vue";
import { EmojiGroup, EmojiGroups } from "@/models/message/emoji/EmojiGroup";
import { SkinTone } from "@/models/message/emoji/SkinTone";
import { getEmojiIndex } from "@/services/message/emoji/getEmojiIndex";
import { useEmojiPickerStore } from "@/store/message/emojiPicker";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";
// The aria-label is what makes a grid cell identifiable, so selecting on it also asserts every button has one.
// Scoped to the grid because the rail's tabs are aria-labelled buttons as well — they are icon-only, so the
// Category title is their accessible name
const getGridEmojis = (component: VueWrapper) => {
  // The grid is not rendered at all when nothing matches — the empty state stands in its place
  const grid = component.findComponent(StyledEmojiPickerGrid);
  return grid.exists() ? grid.findAll("button[aria-label]").map((button) => button.text()) : [];
};

describe("styledEmojiPickerPanel", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  // The whole point of retiring the dependency is that the grid is our own buttons rendering native unicode,
  // So the first assertion worth having is that a category's emoji are on the page at all
  test("opens on the first category with its emoji rendered", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledEmojiPickerPanel);

    expect(getGridEmojis(component)).toStrictEqual(
      getEmojiIndex()
        .byGroup.get(EmojiGroup.SmileysAndEmotion)
        ?.map(({ character }) => character),
    );
  });

  test("renders one rail tab per category", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledEmojiPickerPanel);

    expect(component.findAll(".v-tab")).toHaveLength(EmojiGroups.length);
  });

  test("replaces the grid with results while a query is running", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledEmojiPickerPanel);
    await component.find("input").setValue("thumbs_up");

    expect(getGridEmojis(component)).toStrictEqual(["👍"]);
  });

  test("shows the empty state rather than an empty grid when nothing matches", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledEmojiPickerPanel);
    await component.find("input").setValue("zzzzzz");

    expect(getGridEmojis(component)).toStrictEqual([]);
    expect(component.text()).toContain("No results");
  });

  test("emits the toned character and records the pick as a recent", async () => {
    expect.hasAssertions();

    const emojiPickerStore = useEmojiPickerStore();
    emojiPickerStore.skinTone = SkinTone.Medium;
    const component = await mountSuspended(StyledEmojiPickerPanel);
    await component.find("input").setValue("technologist");
    await component.findComponent(StyledEmojiPickerGrid).find("button[aria-label]").trigger("click");

    expect(component.emitted("select")).toStrictEqual([["🧑🏽‍💻"]]);
    expect(emojiPickerStore.recentEmojiSlugs).toStrictEqual(["technologist"]);
  });
});
