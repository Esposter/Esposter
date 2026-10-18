## Why

The cooking progress is session-only: the dishes learned, each dish's proficiency and the processing queues are not in the save, so a reload forgets them. The stove also opens on the first dish known from the start, not the list the cook knows, and Auto Cook is not on the screen, although the spec already requires both.

## What Changes

- The save keeps the cooking progress as a required `cooking` slice beside crafting, with its merge across two copies.
- The stove lists the dishes the cook knows (known from the start, or learned from an instruction).
- Using an instruction item in the bag teaches its dish.
- Auto Cook is offered on the cooking screen once a dish's proficiency is full.
