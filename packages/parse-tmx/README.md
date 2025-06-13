# parse-tmx

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Inspired by [tmx-map-parser](https://github.com/praghus/tmx-map-parser).
A parser for [Tiled Map Editor](http://www.mapeditor.org/) \*.tmx files.

### Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
bun --bun i parse-tmx
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

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/parse-tmx/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/parse-tmx/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/parse-tmx/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/parse-tmx.svg
