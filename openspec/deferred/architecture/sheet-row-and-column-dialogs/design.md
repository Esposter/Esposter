# Sheet row and column dialogs

The sheet's create and edit dialogs for rows and columns. Each states its own form around the sheet's shared edit button, and the forms repeat each other, so one form dialog could serve both.

## Why deferred

The edit dialogs take their target from the sheet's singleton dialog stores, and their delete step is the sheet's singleton confirm ([singleton dialogs](../../../specs/architecture/singleton-dialogs/design.md)). That mount is what a [singleton confirm](../singleton-confirm-dialog/design.md) would change, so a merged form built now would be shaped around a mount that is about to move.

## Revisit when

The singleton confirm has been built, so the mount each form sits on is settled. Then the forms can merge onto it in one change.
