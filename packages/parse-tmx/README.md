# parse-tmx

<p>
  <a href="https://www.npmjs.com/package/parse-tmx">
    <img src="https://img.shields.io/npm/v/parse-tmx.svg?style=flat&colorA=18181B&colorB=28CF8D" alt="Version">
  </a>
  <a href="https://www.npmjs.com/package/parse-tmx">
    <img src="https://img.shields.io/npm/dm/parse-tmx.svg?style=flat&colorA=18181B&colorB=28CF8D" alt="Downloads">
  </a>
  <a href="https://github.com/Esposter/Esposter/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Esposter/Esposter.svg?style=flat&colorA=18181B&colorB=28CF8D" alt="License">
  </a>
</p>

Inspired by [tmx-map-parser](https://github.com/praghus/tmx-map-parser).
A parser for [Tiled Map Editor](http://www.mapeditor.org/) \*.tmx files.

### Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i parse-tmx
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/modules/parse_tmx.html) to level up.

### Usage

The basic implementation:

```ts
import { parseTmx } from "parse-tmx";
// The *.tmx file can be loaded as a string or URL encoded data
import map from "map.tmx";

// Translates the tile flips in the layer data (default: false)
const translateFlips = true;

const loadMap = async () => {
  const data = await parseTmx(map, translateFlips);
  ...
};
```

### Example data

[TMX Map Format documentation](https://doc.mapeditor.org/en/stable/reference/tmx-map-format/)

```js
{
    tiledversion: "1.8.0",
    tilewidth: 16,
    tileheight: 16,
    version: 1.8,
    width: 512,
    height: 128,
    infinite: 0,
    nextlayerid: 5,
    nextobjectid: 165,
    orientation: "orthogonal",
    renderorder: "right-down",
    properties: {
        property1: 'value',
        property2: 0.5
    },
    layers: [{
        id: 1,
        name: "layer name",
        type: "layer",
        visible: 1,
        data: [0, 1, 1, 10, 10, 10, 1, 1, 0, 0, 0, 0, …],
        // When the translateFlips parameter is enabled
        flips: [
            {H: false, V: false, D: false},
            {H: true, V: false, D: true},
            {H: false, V: false, D: false},
            {…}
        ],
        width: 512,
        height: 128,
        opacity: 0.77,
        properties: {
           property1: 'value',
           property2: false
        }
    }, {
        id: 2,
        name: "objects",
        type: "objectgroup",
        visible: 1,
        objects: [{…}, {…}, {…}],
        properties: {
           property1: 'value',
           property2: false
        }
    }, {
        …
    }],
    tilesets: [{
        columns: 32,
        firstgid: 1,
        image: {source: "tiles.png", width: 512, height: 512},
        name: "tiles",
        tilecount: 1024,
        tilewidth: 16,
        tileheight: 16,
        tiles: [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
    }, {
        …
    }]
}
```

## <a name="license">⚖️ License</a>

[Apache-2.0 licensed](https://github.com/Esposter/Esposter/blob/main/LICENSE)
