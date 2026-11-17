## Why

A panel takes an enable condition, and a page does not. An owner who wants a page to show but wait on an earlier answer has to wrap the page's questions in a panel, and the page itself stays enabled. The reference product disables a whole page with a condition, so its questions are drawn but inert until the condition holds.

## What Changes

- A page takes an enable condition beside its visibility condition, written in the Logic tab as a panel's is.
- While the condition does not hold, the page's questions are drawn disabled, and the runner does not check them when the respondent moves off the page or submits.
- A survey saved before this change reads every page with an empty enable condition, which holds always, so it behaves as before.

## Capabilities

### Modified Capabilities

- `survey-runner`: a page whose enable condition does not hold draws its questions disabled, and its questions are not checked on a move or a submit.
- `survey-logic-builder`: a page takes an enable condition in the Logic tab.

## Impact

The page's props gain one condition, which the save check reads as it reads a panel's. The page's enabled state becomes the parent state of its element views, so the runner's move, its completion and the server's check of a submit all read the one decision. The design surface is unchanged: it draws every question disabled whatever its condition, so a page's condition shows in the preview and on the respondent page, not on the surface.
