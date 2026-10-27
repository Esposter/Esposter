# vue-grid-layout-headless

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A headless grid: `useGridLayout` returns the placement of items on a grid of cells, their tiles and a `startGesture` handler that moves or resizes them, with no styling.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/vue-grid-layout-headless).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i vue-grid-layout-headless
```

```vue
<script setup lang="ts">
import { CollisionMode, CompactType, useGridLayout } from "vue-grid-layout-headless";
import { shallowRef, useTemplateRef } from "vue";

const root = useTemplateRef<HTMLElement>("root");
const items = shallowRef([{ h: 2, id: "a", w: 4, x: 0, y: 0 }]);
const { gridHeight, startGesture, tiles } = useGridLayout(root, () => ({
  collision: CollisionMode.Push,
  columnNumber: 12,
  compactType: CompactType.Vertical,
  dragStartDistance: 4,
  isEditable: true,
  items: items.value,
  rowHeight: 40,
  spacing: { gap: 10, padding: 10 },
  // A release replaces the cells it changed and drops the ids it removed
  onCommit: ({ changes, removed }) => {
    const changedIds = new Set(changes.map(({ id }) => id));
    items.value = [...items.value.filter(({ id }) => !changedIds.has(id) && !removed.includes(id)), ...changes];
  },
}));
</script>

<template>
  <div ref="root" :style="{ height: `${gridHeight}px`, position: 'relative' }">
    <div
      v-for="{ geometry, item, offset } in tiles"
      :key="item.id"
      :style="{
        height: `${geometry.height}px`,
        left: `${geometry.left}px`,
        position: 'absolute',
        top: `${geometry.top}px`,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        width: `${geometry.width}px`,
      }"
      @pointerdown="startGesture($event, item)"
    />
  </div>
</template>
```

Each tile's `geometry` is the box to draw it in, in pixels from the grid's top left corner, and its `offset` moves a dragged tile so it stays under the pointer.

## <a name="key-exports">🧩 Key Exports</a>

| Export              | Kind       | Purpose                                                                                                    |
| ------------------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| `CollisionMode`     | enum       | What a dropped item does to the items it lands on: push, swap, or prevent the drop                         |
| `CompactType`       | enum       | The direction a layout compacts in: vertical, horizontal, or none                                          |
| `GridCommit`        | interface  | What a release writes back: the cells one gesture changed or added, and the ids it removed                 |
| `GridItem`          | interface  | A cell the grid places, named by the entity it lays out                                                    |
| `GridLayout`        | interface  | What a grid hands its consumer: the tiles to draw, the drag placeholder, the height and the press handler  |
| `GridLayoutOptions` | interface  | What a grid lays out and how its gestures read the pointer, passed to the composable as a getter           |
| `GridTile`          | interface  | An item as the grid draws it: its box, and the offset a dragged item is drawn at                           |
| `ResizeEdge`        | enum       | The edge or corner a resize pulls                                                                          |
| `startExternalDrag` | function   | Drags an item from outside every grid, such as a palette entry, and lands it on the grid under the release |
| `useGridLayout`     | composable | Places items on a grid, and previews and commits the moves and resizes a pointer makes of them             |

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=038758
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/vue-grid-layout-headless/latest?color=038758
[url-npm]: https://www.npmjs.com/package/vue-grid-layout-headless/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/vue-grid-layout-headless/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/vue-grid-layout-headless.svg
