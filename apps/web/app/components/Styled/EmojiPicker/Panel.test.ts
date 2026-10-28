// @vitest-environment nuxt
import type { CustomEmoji } from "@/models/message/emoji/CustomEmoji";
import type { VueWrapper } from "@vue/test-utils";

import StyledEmojiPickerGrid from "@/components/Styled/EmojiPicker/Grid.vue";
import StyledEmojiPickerPanel from "@/components/Styled/EmojiPicker/Panel.vue";
import UiEmptyState from "@/components/Ui/EmptyState.vue";
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
import { flushPromises } from "@vue/test-utils";
import { getMockSasUrl } from "azure-mock";
import { assert, beforeEach, describe, expect, test } from "vitest";

// The aria-label is what makes a grid cell identifiable, so selecting on it also asserts every button has one.
// Scoped to the grid because the rail's categories are aria-labelled buttons as well — they are icon-only, so the
// Category title is their accessible name
const getGridEmojis = (component: VueWrapper) => {
  // The grid is not rendered at all when nothing matches — the empty state stands in its place
  const grid = component.findComponent(StyledEmojiPickerGrid);
  return grid.exists() ? grid.findAll("button[aria-label]").map((button) => button.text()) : [];
};
// One category's emoji by character, in the order the grid shows them
const getCategoryCharacters = (group: EmojiGroup) =>
  getEmojiIndex()
    .groupEmojisMap.get(group)
    ?.map(({ character }) => character);

describe("styledEmojiPickerPanel", () => {
  const RAIL_BUTTON_SELECTOR = '[role="radiogroup"][aria-label="Categories"] [role="radio"]';
  const name = "name";
  const customEmoji: CustomEmoji = {
    id: crypto.randomUUID(),
    name,
    sasUrl: getMockSasUrl("", undefined),
    slug: name,
    type: EmojiType.Custom,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  // The grid is our own buttons rendering native unicode rather than a dependency's, so the first assertion
  // Worth having is that a category's emoji are on the page at all
  test("opens on the first category with its emoji rendered", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledEmojiPickerPanel);

    expect(getGridEmojis(component)).toStrictEqual(getCategoryCharacters(EmojiGroup.SmileysAndEmotion));
  });

  test("renders one rail button per category", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledEmojiPickerPanel);

    expect(component.findAll(RAIL_BUTTON_SELECTOR).map((button) => button.attributes("aria-label"))).toStrictEqual(
      EmojiGroups,
    );
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
    await component.find("input").setValue("-");

    expect(getGridEmojis(component)).toStrictEqual([]);
    expect(component.findComponent(UiEmptyState).text()).toBe("No resultsNothing matches “-”.");
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
    await component.find("input").setValue(name);
    await component.findComponent(StyledEmojiPickerGrid).find("button[aria-label]").trigger("click");

    expect(component.emitted("select")).toStrictEqual([[getCustomEmojiTag(customEmoji.id), customEmoji]]);
  });

  // The room's last emoji can be deleted while the picker sits on its category, so the rail has to fall back with the
  // Grid rather than press a category that is gone
  test("falls back to the first category when the active one leaves the rail", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledEmojiPickerPanel, { props: { customEmojis: [customEmoji] } });
    await component.find(`${RAIL_BUTTON_SELECTOR}[aria-label="${ROOM_EMOJI_CATEGORY_TITLE}"]`).trigger("click");

    expect(component.find(`${RAIL_BUTTON_SELECTOR}[aria-checked="true"]`).attributes("aria-label")).toBe(
      ROOM_EMOJI_CATEGORY_TITLE,
    );

    await component.setProps({ customEmojis: [] });
    const categoryTitles = component.findAll(RAIL_BUTTON_SELECTOR).map((button) => button.attributes("aria-label"));

    expect(categoryTitles).not.toContain(ROOM_EMOJI_CATEGORY_TITLE);
    expect(component.find(`${RAIL_BUTTON_SELECTOR}[aria-checked="true"]`).attributes("aria-label")).toBe(
      EmojiGroup.SmileysAndEmotion,
    );
  });

  // Search replaces the grid, but the rail stays live through it: picking a category is a pick of what to show, so it
  // Clears the query and shows that category rather than leaving the results on screen
  test("#136 picking a category during a search clears the search and shows that category", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledEmojiPickerPanel);
    await component.find("input").setValue("thumbs_up");
    await component.find(`${RAIL_BUTTON_SELECTOR}[aria-label="${EmojiGroup.AnimalsAndNature}"]`).trigger("click");

    expect((component.find("input").element as HTMLInputElement).value).toBe("");
    expect(getGridEmojis(component)).toStrictEqual(getCategoryCharacters(EmojiGroup.AnimalsAndNature));
  });

  // The grid is one stop in the tab order, so Tab crosses it once rather than once per emoji, and the arrows walk from it
  test("#258 the grid has one tab stop, on its first emoji", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledEmojiPickerPanel);

    expect(
      component.findAll('button[data-index][tabindex="0"]').map((button) => button.attributes("data-index")),
    ).toStrictEqual(["0"]);
  });

  // The arrows walk a cell and a row, Home and End go to a row's ends, and the focused button is named by its emoji,
  // Which is what a screen reader announces. The grid is attached so focus lands on the cell it moves to
  test("#258 arrow keys walk the grid by cell and by row, naming each focused emoji, with Home and End to a row's ends", async () => {
    expect.hasAssertions();

    const smileys = getEmojiIndex().groupEmojisMap.get(EmojiGroup.SmileysAndEmotion);
    assert.exists(smileys);
    const component = await mountSuspended(StyledEmojiPickerPanel, { attachTo: document.body });
    const getCell = (index: number) => component.get(`button[data-index="${index}"]`);
    const pressOn = async (index: number, key: string) => {
      await getCell(index).trigger("keydown", { key });
      await flushPromises();
    };

    await pressOn(0, "ArrowRight");
    expect(document.activeElement).toBe(getCell(1).element);
    expect(document.activeElement?.getAttribute("aria-label")).toBe(takeOne(smileys, 1).name);
    await pressOn(1, "ArrowDown");
    expect(document.activeElement).toBe(getCell(9).element);
    await pressOn(9, "End");
    expect(document.activeElement).toBe(getCell(15).element);
    await pressOn(15, "Home");
    expect(document.activeElement).toBe(getCell(8).element);
    await pressOn(8, "ArrowLeft");
    expect(document.activeElement).toBe(getCell(7).element);
    await pressOn(7, "ArrowUp");
    expect(document.activeElement).toBe(getCell(7).element);
  });

  test("a new result list starts its tab stop at its first emoji", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledEmojiPickerPanel, { attachTo: document.body });
    const getCell = (index: number) => component.get(`button[data-index="${index}"]`);
    for (let index = 0; index < 15; index++) {
      // oxlint-disable-next-line no-await-in-loop -- Each press moves the tab stop the next press starts from
      await getCell(index).trigger("keydown", { key: "ArrowRight" });
      // oxlint-disable-next-line no-await-in-loop -- The focus move settles before the next press reads it
      await flushPromises();
    }
    await component.find("input").setValue("technologist");
    await flushPromises();

    expect(getCell(0).attributes("tabindex")).toBe("0");
  });

  // Enter is the button's own pick, handled on its keydown so a focused emoji picks without a click, and it stores the
  // Pick as a recent the same way a click does
  test("#258 Enter picks the focused emoji with its record and stores it as a recent", async () => {
    expect.hasAssertions();

    const emojiPickerStore = useEmojiPickerStore();
    emojiPickerStore.skinTone = SkinTone.Medium;
    const component = await mountSuspended(StyledEmojiPickerPanel, { attachTo: document.body });
    await component.find("input").setValue("technologist");
    await component.get('button[data-index="0"]').trigger("keydown", { key: "Enter" });

    expect(component.emitted("select")).toStrictEqual([["🧑🏽‍💻", takeOne(searchEmojis("technologist"))]]);
    expect(emojiPickerStore.recentEmojiSlugs).toStrictEqual(["technologist"]);
  });
});
