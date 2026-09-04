---
title: Clicker types
description: The Default/Magical/Physical theming layer — compiled flavor-text variables and per-type name, icon, and color maps.
---

# Clicker Types

The clicker type is a pure theming layer: switching between Default, Magical, and Physical (the toolbar selectors) instantly reskins the item's name, plural name, SVG icon, and color everywhere — page title, store text, stats — without touching any game state except the saved `type` field.

## How it works

Constant maps in `app/services/clicker/properties/` key every display property by `ClickerType`: `ClickerNameMap` / `ClickerPluralNameMap` (what a point is called), `ClickerIconComponentMap` (the SVG component rendered as the clickable item), and `getClickerColorMap` (theme-aware color per type, resolved from the colors store).

Flavor text in the content maps is written once with **compiled variables** — `BuildingMap` descriptions embed `compileVariable("pluralName")` placeholders, and `useDecompileString` substitutes the active type's properties reactively at render time. One content set therefore serves all three themes.

The chosen type is part of the save (`clicker.type`), so it persists like any other purchase and its change triggers an immediate save through the `virtualClicker` watch.

## Key files

Paths relative to `packages/app`.

| File                                                 | Role                                                    |
| ---------------------------------------------------- | ------------------------------------------------------- |
| `shared/models/clicker/data/ClickerType.ts`          | the type enum + schema                                  |
| `app/services/clicker/properties/ClickerNameMap.ts`  | type → point name (with plural + icon + color siblings) |
| `app/composables/clicker/useDecompileString.ts`      | reactive flavor-text variable substitution              |
| `app/components/Clicker/Model/ItemTypeSelectors.vue` | toolbar type switcher                                   |
| `shared/services/compiler/compileVariable.ts`        | the shared compile/decompile variable format            |
