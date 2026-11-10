## Why

Five dialogs put a submit in their own footer and point it at their form with the same two lines: a generated form id, `:id` on the form and `:form` on the footer button, with the same comment restated each time. The shared dialog shell already binds that submit for the dialogs that compose it, so the five copies are the form-and-footer wiring the shell was meant to hold. Whether they should compose the shell, or the shell should take a footer-submit binding for a footer it does not draw, is a design decision the review could not make.

## What Changes

- The dialogs that submit a form from their own footer take the form id from one shared mechanism, not from a `useId` they each declare.
- The choice is between two shapes, decided in the design: the dialogs compose the form dialog shell with their own actions in its footer, or the base dialog takes the footer-submit binding for a footer it does not draw.

## Capabilities

### Modified Capabilities

- dialog-shell (architecture/dialog-shell): a dialog whose footer submits its form gets the form id from the shell, not from each dialog.

## Impact

The member action dialog shell, the display name and notes dialogs, the blueprint deploy dialog and the share dialog change how they reach the form id. No stored data and no user-visible behaviour change.
