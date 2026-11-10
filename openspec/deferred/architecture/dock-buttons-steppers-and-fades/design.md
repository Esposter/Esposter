# Dock buttons, steppers and fades

Three small shapes the library and the dock repeat: the dock's buttons, the calendars' previous and next steppers, and the fade a new month or week draws its days in with. Each is written out at every site that uses it.

## Why deferred

They are library-internal and cosmetic. No reader's task waits on any of them, and each is a few lines of markup and classes, so a shared shape would move styling between files without changing what a reader sees.

## Revisit when

A design-style change has to reach one of these shapes, and a reader sees one of its sites differ from its siblings in the same style. Then one shared shape turns the change into one edit.
