## 1. Selection

- [x] 1.1 Hold the selected visual's id in the dashboard store, with an empty id as nothing selected, set by a press or Enter on a visual and cleared by a press on the empty canvas and by the visual's delete. Verify: tests named after the scenarios 'Pressing a visual selects it' and 'Deleting the selected visual clears the selection', written first and seen failing.

## 2. Layout

- [x] 2.1 Declare the dashboard's layout and registry on the shell: the bar, the Visuals region, the inspector and the canvas, with the selection kinds nothing, visual and group. Verify: the shell's layout check passes for the dashboard.
- [x] 2.2 Move the visual's edit form and dataset binding from the dialog into the inspector's visual entry, and the group's title into its group entry. Verify: tests named after 'Selecting a visual shows its edit form in the inspector', 'A form change redraws the visual' and 'A group selected shows its title', seen failing first.
- [x] 2.3 Move the Layout popover's content into the inspector's entry for nothing selected, and make the palette the Visuals region. Verify: tests named after 'Nothing selected shows the dashboard's layout settings' and 'The palette is a region the reader opens', seen failing first.
- [x] 2.4 Delete the edit form dialog, the Layout popover and the palette strip. Verify: the typecheck, a `git grep` of their component names returning nothing outside the archive, and the test named after 'The published page draws no editor regions' passing before and after the edits, since the published page already draws none and the test only guards it.
- [ ] 2.5 Drive the dashboard in a browser once after the edits, at a wide window and a phone width: bind a chart, change its type with the canvas in view, and open the palette as a sheet. Verify: no test, since happy-dom has no layout.

## 3. Specs

- [x] 3.1 Rewrite the dashboard grid design's surface table as built, with the edit visual, layout and palette rows moved. Verify: the OpenSpec citation checks pass in `scripts`.
