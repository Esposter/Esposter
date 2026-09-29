---
title: Voxel runtime budget
description: The cost rules for the agent console's voxel views and themed rooms — rejected, because the views it governed are rejected and the Genshin engine keeps a budget of its own.
---

# Voxel runtime budget

The proposal set what the voxel world's views and themed rooms, the codebase city and the atelier above all, might cost to run: build only what the camera could see, rebuild only the dirty chunk or instance, mesh off the main thread, and load each room's models when it was entered.

**Why not:** The rooms and views it governed are rejected with the voxel world. The [engine architecture](/docs/proposals/genshin/engine-architecture) states the same rules for the Genshin world, where they matter at a continent's scale: nothing allocated per frame, draws in the tens, generation in workers, and every generator benched at two scales.
