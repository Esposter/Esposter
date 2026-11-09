# Creator Keyboard Coverage

Three rows of SurveyJS's keyboard and screen-reader support for its Creator: moving the selected element with the keyboard, shortcuts for duplicate, remove and move to, and a live-region announcement of each move. Esposter builds the Alt and arrow moves. The other three parts are missing.

## Why deferred

The Creator's own spec lists the missing parts under "Not built": the Alt and arrow moves are not read out through a live region, and duplicate, remove and move to have no keyboard shortcut ([survey creator design](../../../specs/resource/survey-creator/design.md)). The layers tree is not a reorderable list, so nothing announces a move, and the moved row keeps keyboard focus. Each of the three commands is reached today through its row's menu, so a shortcut would add a second route to the same commands.

**Revisit when:** keyboard-only or screen-reader authors ask for the shortcuts, or for each move to be read out.
