// @vitest-environment nuxt
import type { CustomEmoji } from "@/models/message/emoji/CustomEmoji";
import type { VueWrapper } from "@vue/test-utils";

import StyledEmojiPickerGrid from "@/components/Styled/EmojiPicker/Grid.vue";
import StyledEmojiPickerPanel from "@/components/Styled/EmojiPicker/Panel.vue";
import { EmojiGroup, EmojiGroups } from "@/models/message/emoji/EmojiGroup";
import { EmojiType } from "@/models/message/emoji/EmojiType";
import { SkinTone } from "@/models/message/emoji/SkinTone";
import { ROOM_EMOJI_CATEGORY_TITLE } from "@/services/message/emoji/constants";
import { getCustomEmojiTag } from "@/services/message/emoji/getCustomEmojiTag";
import { getEmojiIndex } from "@/services/message/emoji/getEmojiIndex";
import { searchEmojis } from "@/services/message/emoji/searchEmojis";
import { useEmojiPickerStore } from "@/store/message/emojiPicker";
import { takeOne } from "@esposter/shared";
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
  const customEmoji: CustomEmoji = {
    id: crypto.randomUUID(),
    name: "party_parrot",
    sasUrl: "https://storage.test/emoji",
    slug: "party_parrot",
    type: EmojiType.Custom,
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  // The whole point of retiring the dependency is that the grid is our own buttons rendering native unicode,
  // So the first assertion worth having is that a category's emoji are on the page at all
  test("opens on the first category with its emoji rendered", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledEmojiPickerPanel);

    expect(getGridEmojis(component)).toStrictEqual(
      getEmojiIndex()
        .groupEmojisMap.get(EmojiGroup.SmileysAndEmotion)
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

  // The tag leads and the record follows: reaction surfaces store the first, the composer needs the second to
  // Know whether to insert a character or a custom-emoji node
  test("emits the toned character with its record and stores the pick as a recent", async () => {
    expect.hasAssertions();

    const emojiPickerStore = useEmojiPickerStore();
    emojiPickerStore.skinTone = SkinTone.Medium;
    const component = await mountSuspended(StyledEmojiPickerPanel);
    await component.find("input").setValue("technologist");
    await component.findComponent(StyledEmojiPickerGrid).find("button[aria-label]").trigger("click");

    expect(component.emitted("select")).toStrictEqual([["🧑🏽‍💻", takeOne(searchEmojis("technologist"))]]);
    expect(emojiPickerStore.recentEmojiSlugs).toStrictEqual(["technologist"]);
  });

  // A custom emoji emits the id-keyed tag a reaction stores, never its name — a rename must not strand one
  test("emits a custom emoji as its id tag with its record", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledEmojiPickerPanel, { props: { customEmojis: [customEmoji] } });
    await component.find("input").setValue("party_parrot");
    await component.findComponent(StyledEmojiPickerGrid).find("button[aria-label]").trigger("click");

    expect(component.emitted("select")).toStrictEqual([[getCustomEmojiTag(customEmoji.id), customEmoji]]);
  });

  // The room's last emoji can be deleted while the picker sits on its category. `v-tabs` given a value no tab
  // Carries shows no active tab at all, so the rail has to fall back with the grid rather than go blank over it
  test("falls back to the first category when the active one leaves the rail", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledEmojiPickerPanel, { props: { customEmojis: [customEmoji] } });
    await component.find(`.v-tab[aria-label="${ROOM_EMOJI_CATEGORY_TITLE}"]`).trigger("click");

    expect(component.find(".v-tab--selected").attributes("aria-label")).toBe(ROOM_EMOJI_CATEGORY_TITLE);

    await component.setProps({ customEmojis: [] });
    const categoryTitles = component.findAll(".v-tab").map((tab) => tab.attributes("aria-label"));

    expect(categoryTitles).not.toContain(ROOM_EMOJI_CATEGORY_TITLE);
    expect(component.find(".v-tab--selected").attributes("aria-label")).toBe(takeOne(categoryTitles));
  });
});
