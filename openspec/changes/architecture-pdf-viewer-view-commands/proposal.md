## Why

A reader of a long attachment reaches its end by typing the page count into the page field, and a reader of a narrow document has no way to fill the dialog's width with it: the menu fits a whole page or shows the page at its own size, and nothing between. The reference viewer has a first page and a last page command, and a width fit among its zoom choices.

## What Changes

- The More menu gains **First page** and **Last page**, which go to page one and to the document's last page.
- The More menu gains **Fit width**, which scales the pages to the width of the viewer, beside **Fit page** and **Actual size**.
- First page is unavailable on page one and Last page on the last page.
- The package's fit-to-width, which the viewer already holds, is the command that Fit width calls.

## Capabilities

### Modified Capabilities

- pdf-viewer (architecture/pdf-viewer): the More menu gains three view commands.

## Impact

Three items join the menu's view group, drawn with the app's menu items. The package is unchanged, since it already goes to a page and fits to width. The viewer keeps its rule that it adds no shortcut of its own, so each command is a menu item reached by Tab.
