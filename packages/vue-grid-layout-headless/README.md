# vue-grid-layout-headless

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

This package is a headless grid with no styling. `useGridLayout` returns the placement of items on a grid of cells, their tiles, and a `startGesture` handler that moves or resizes them.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/vue-grid-layout-headless).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

1. Install the package.

```bash
pnpm i vue-grid-layout-headless
```

2. Create a component from this code. After a release, `items` holds the changed cells.

```vue
<script setup lang="ts">
import { CollisionMode, CompactType, ResizeEdge, useGridLayout } from "vue-grid-layout-headless";
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
  // A release replaces the cells it changed
  onCommit: ({ changes }) => {
    const changedIds = new Set(changes.map(({ id }) => id));
    items.value = [...items.value.filter(({ id }) => !changedIds.has(id)), ...changes];
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
    >
      <span class="resize-handle" @pointerdown.stop="startGesture($event, item, ResizeEdge.SouthEast)" />
    </div>
  </div>
</template>
```

Each tile supplies these values:

- `geometry` is the box that draws the tile, in pixels from the grid's top left corner.
- `offset` moves a dragged tile, so that it stays under the pointer.

## <a name="key-exports">🧩 Key Exports</a>

| Export               | Kind       | Purpose                                                                                                                                                      |
| -------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `checkChangesHeight` | function   | Whether pulling an edge or corner changes an item's height, since a north, south or corner pull has a vertical part                                          |
| `CollisionMode`      | enum       | What a dropped item does to the items it lands on: push, swap, or prevent the drop                                                                           |
| `CompactType`        | enum       | The direction a layout compacts in: vertical, horizontal, or none                                                                                            |
| `getFirstFreeCell`   | function   | The first cell a new item of a given span fits in, scanning rows from the top and columns from the left                                                      |
| `GridBlock`          | interface  | A cell the grid places, named by its id: what a move, a commit or a placement carries                                                                        |
| `GridCommit`         | interface  | What a release writes back: the cells that one gesture changed                                                                                               |
| `GridItem`           | interface  | A block the grid places, named by the entity it lays out, and whether that entity takes its height from its content                                          |
| `GridLayout`         | interface  | What a grid hands its consumer: the tiles to draw, the placeholder, the height, the press and the step                                                       |
| `GridLayoutOptions`  | interface  | What a grid lays out and how its gestures read the pointer, passed to the composable as a getter                                                             |
| `GridPlaceholder`    | interface  | The box a drag draws where its item would land, marked when the grid would refuse the landing                                                                |
| `GridStep`           | interface  | A keyboard step: the whole cells an item moves by and the whole cells its span grows by                                                                      |
| `GridTile`           | interface  | An item as the grid draws it: its box, and the offset a dragged item is drawn at                                                                             |
| `ResizeEdge`         | enum       | The edge or corner that a resize pulls                                                                                                                       |
| `startExternalDrag`  | function   | Drags an item from outside every grid, such as a palette entry. Previews it on the grid under the pointer and passes the cell it lands on to a drop callback |
| `useGridLayout`      | composable | Places items on a grid. Previews and commits the moves and resizes that a pointer makes, and steps an item from the keyboard                                 |

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/vue-grid-layout-headless/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/vue-grid-layout-headless/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/vue-grid-layout-headless/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/vue-grid-layout-headless.svg
