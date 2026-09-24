---
title: Search token field
description: Proposal — a library token field with an attached panel, so the message search's filters become chips in the field and its menu a panel that keeps focus in the field, replacing the Vuetify autocomplete, chips and menu it is built from.
model: claude-opus-5-5
---

# Search Token Field

The message search reads Discord's way: a query holds free text and filters — `from:`, `in:`, `has:`, `before:` — each drawn as a chip in the field, and a panel under the field offers what to type next and fills a pending filter's value ([message search](/docs/esbabbler/message-search)). Today that is a Vuetify autocomplete holding Vuetify chips, under a Vuetify menu whose width is measured from the field. It is the last surface of the message area on Vuetify, and its menu moves focus the way a menu does, where a completion must leave it in the field.

## What works today

- The filters, their pending state and the picker each one opens are the search store's and `SearchFilterComponentMap`'s, and none of that changes.
- The date filters pick a day in `UiCalendar` already.
- `UiSuggestions` completes a text field with focus kept in it, by virtual focus.

## What this adds

- **`UiTokenField`**: a field holding a row of `UiChip` tokens before its text. Backspace in an empty text removes the last token and the arrows walk into the tokens, each removable by its own button as a chip is. Its tokens are data, as a menu's items are.
- **An attached panel**: a popover anchored to the field at its width by CSS anchor sizing, never by a measured width, that opens as the field is focused and keeps focus in it. Its content is the call site's — the search's options, its history, or a pending filter's picker.
- **The search moved onto both**: `Input.vue` and `Menu.vue` stop importing Vuetify, and their @TODOs go.

## Next steps

1. Build `UiTokenField` with its keyboard contract test, run once per style: tokens in the tab order only through the arrows, Backspace into the last token, each token's remove button named by its title.
2. Give `UiSuggestions` the anchor-width panel as a variant rather than a second popover, since both keep focus in their field.
3. Move `RightSideBar/Search/Input.vue` and `Menu.vue` onto them, the filter pickers unchanged inside the panel, and ban `v-autocomplete` and `v-chip` once their last consumers go.

## Key files

| File                                                            | Role after the change                                  |
| :-------------------------------------------------------------- | :----------------------------------------------------- |
| `apps/web/app/components/Message/RightSideBar/Search/Input.vue` | The token field holding the query's filters            |
| `apps/web/app/components/Message/RightSideBar/Search/Menu.vue`  | The attached panel's content: options, history, picker |
| `apps/web/app/components/Ui/Suggestions.vue`                    | The virtual-focus panel the token field's panel shares |
| `apps/web/app/components/Ui/Chip.vue`                           | Each token                                             |

## Sources

- [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) — focus kept in the field, the panel's options as its active descendant.
- [Discord](https://discord.com/), the messaging area's reference product — a search whose filters are tokens typed into the one field.
