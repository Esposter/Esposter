# Collision swap and prevent

## What it was

A collision option named what a dropped item did to the items it landed on. Swap traded places with the one item it landed on, and pushed the items aside when it landed on several or resized. Prevent refused a drop that landed on another item, so every item stayed where it was, and a drop onto another grid's item was refused as well. The grid's default was to push, which it keeps.

## Why deferred

The dashboard needs none of it: every drop pushes the visuals it lands on, and no visual is traded or refused.

## Revisit when

A second grid consumer needs it.
