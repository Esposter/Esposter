# Merged undo and redo buttons

One toolbar button for the sheet's undo and redo, with the direction passed in.

## Why not

The two buttons differ in six places: the store's reading of whether each can run, the description its tooltip shows, the command each runs, its label, its icon and its shortcut. A merged button would branch on the direction for every one of them, so the direction would become a switch over six reads, each of which the two buttons already state in one line. Two buttons keep each difference in the line that states it.
