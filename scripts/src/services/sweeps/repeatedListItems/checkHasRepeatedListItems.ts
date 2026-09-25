const LIST_ITEM_REGEX = /\sui-(?:item|row)(?=[\s/>])/gu;
const LOOP_REGEX = /v-for/u;
const MINIMUM_LIST_ITEMS = 3;
// Rows written out one by one where an array and a `v-for` belong. A row is an element wearing the library's
// `ui-item` or `ui-row` attribute; the lookahead is what keeps it honest, since without it `ui-item-content` and any
// Longer name starting the same way would count as rows of their own
export const checkHasRepeatedListItems = (text: string): boolean =>
  !LOOP_REGEX.test(text) && [...text.matchAll(LIST_ITEM_REGEX)].length >= MINIMUM_LIST_ITEMS;
