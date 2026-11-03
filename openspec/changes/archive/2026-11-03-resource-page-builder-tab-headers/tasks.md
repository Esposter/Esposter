## 1. Find the tabs

- [x] 1.1 Open the page builder and the email editor in the browser and list every tab header on each surface, including the one named Layout. Verify: the list is written into this change's design under Notes. (Done from source, with no browser pass; the Layout item is a style sector, see the design's Notes.)

## 2. Restyle

- [x] 2.1 Give the page builder's tab headers the app's header style, through a variant of the shared tabs component that the other tab surfaces do not take, and the email editor's Design and Preview control the style its design Notes set out. Verify: the owner checks the header style in the browser and notes the result here. (Done: `UiTabsVariant.Header` for the node settings tabs and `UiToggleGroupVariant.Header` for the email's view toggle. Checked in a driven Chrome at the owner's instruction: the selected tab and the chosen choice compute the same full text colour under the same indicator in both themes.)
- [x] 2.2 Give the Style panel's sector headers, Layout among them, the app's header style through a variant of `UiCollapsible` that no other collapsible takes. Verify: the owner checks the Style tab in the browser, where every sector header matches the tab headers' selected state, and notes the result here. (Done: `UiCollapsibleVariant.Header`. Checked in a driven Chrome at the owner's instruction: each of the eight sector headers draws the selected tab's indicator while open and none while closed.)
