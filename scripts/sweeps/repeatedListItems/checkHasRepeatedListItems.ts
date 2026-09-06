const LIST_ITEM_REGEX = /<v-list-item[ >]/gu;
const LOOP_REGEX = /v-for/u;
const MINIMUM_LIST_ITEMS = 3;

// Rows written out one by one where an array and a `v-for` belong. The `[ >]` is what keeps it honest: without
// It `v-list-item-title` and `-subtitle` count as rows of their own, and every single-row shell reads as a hit.
export const checkHasRepeatedListItems = (text: string): boolean =>
  !LOOP_REGEX.test(text) && [...text.matchAll(LIST_ITEM_REGEX)].length >= MINIMUM_LIST_ITEMS;
