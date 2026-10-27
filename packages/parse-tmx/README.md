# parse-tmx

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A parser for [Tiled Map Editor](http://www.mapeditor.org/) \*.tmx files, inspired by [tmx-map-parser](https://github.com/praghus/tmx-map-parser).

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/parse-tmx).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- 📝 [Usage](#usage)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i parse-tmx
```

## <a name="key-exports">🧩 Key Exports</a>

| Export             | Kind      | Purpose                                                                                                      |
| :----------------- | :-------- | :----------------------------------------------------------------------------------------------------------- |
| `parseTileset`     | function  | Reads an external tileset file, as Tiled writes one, into the embedded tileset it holds, without a map       |
| `parseTmx`         | function  | Parses a `.tmx` string into a `TMXParsed`, matching Phaser's tilemap export and supporting external tilesets |
| `PropertyType`     | enum      | The types a Tiled custom property can have, such as `int` or `string`                                        |
| `Shape`            | enum      | The shapes a Tiled object can take, such as `rectangle` or `polygon`                                         |
| `TMXLayerParsed`   | interface | A layer as parsed: its tile data, flips, objects and properties                                              |
| `TMXMapParsed`     | class     | The map element's attributes, with the defaults a map that omits them reads as                               |
| `TMXParsed`        | class     | The parse result, holding the parsed map as `map`                                                            |
| `TMXTilesetParsed` | type      | A tileset as parsed: an embedded one or an external one                                                      |

## <a name="usage">📝 Usage</a>

```ts
import { parseTmx } from "parse-tmx";

// The *.tmx file is read as text, here from a URL
const xmlString = await (await fetch("/maps/dungeon.tmx")).text();

// Translates the tile flips in the layer data (default: false)
const translateFlips = true;

// parseTmx resolves to a neverthrow Result, so the parsed map is taken from its Ok branch and an error is rethrown
const { map } = (await parseTmx(xmlString, translateFlips)).match(
  (tmxParsed) => tmxParsed,
  (error) => {
    throw error;
  },
);

console.log(map.layers.length);
```

### <a name="example-data">📄 Example data</a>

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
    properties: [
        {name: 'property1', value: 'value'},
        {name: 'property2', value: 0.5}
    ],
    layers: [{
        id: 1,
        name: "layer name",
        type: "layer",
        // Only written when the layer is hidden in Tiled
        visible: 0,
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
        properties: [
           {name: 'property1', value: 'value'},
           {name: 'property2', value: false}
        ]
    }, {
        id: 2,
        name: "objects",
        type: "objectgroup",
        objects: [{…}, {…}, {…}],
        properties: [
           {name: 'property1', value: 'value'},
           {name: 'property2', value: false}
        ]
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

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=0b6ac0
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/parse-tmx/latest?color=1b7a5f
[url-npm]: https://www.npmjs.com/package/parse-tmx/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/parse-tmx/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/parse-tmx.svg
