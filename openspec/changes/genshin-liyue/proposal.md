# Liyue

## Why

Liyue's land is vertical: karst pillars and stone forests rise from plains, clouds and sea, and its harbour is built in tiers up a cliff. The region's shapes need rock meshes that a heightfield cannot hold, and its karst and stone forests are not yet built. The region is also where the terrain's rule of meshes on top of heights is used most, so it cannot be recreated until those meshes stand.

## What Changes

Build Liyue region by region on the shared engine: its karst and stone-forest rock, its sea of clouds, its harbour, the Chasm as a layer, and Chenyu Vale.

- Jueyun Karst's pillars, Huaguang Stone Forest, Guyun Stone Forest's spears and the sea stacks are rock meshes, placed as landmarks or by rule within their area's outline.
- A layer of stepped cloud sits below the summits around Jueyun Karst and the high peaks.
- Liyue Harbor is a set of landmarks on stepped streets up its cliff, with its wharves below.
- Wangshu Inn is a tower on a rock pillar, and Qingce Village is terraced paddies of still water around a great tree.
- The Chasm is a layer: an open-pit mine above ground, and its underground mines a separate layer, dark except for lamps and glowing ore.
- Chenyu Vale is terraced tea slopes, waterfalls, low mist and villages in white walls.

## Capabilities

- **genshin/liyue** (new)

## Waiting on

- Exports holding the karst and the stone forests, which Liyue's extraction does not yet hold. An extraction reaching their streams needs the game's install.
- Liyue's passes reaching shape: its Layout waits on the camera its harbour landmarks solve, and its Camera waits on the Layout.

## Impact

Liyue's areas in the open world, its rock meshes and sea of clouds, its harbour and its Chasm layer, and Chenyu Vale. The region's generators under the Liyue services of the world package, and the noise the karst meshes' strata use in the engine.
