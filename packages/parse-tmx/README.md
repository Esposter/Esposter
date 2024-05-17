# parse-tmx [![NPM Version](https://img.shields.io/npm/v/parse-tmx.svg?style=flat)](https://www.npmjs.org/package/parse-tmx)

Inspired by [tmx-map-parser](https://github.com/praghus/tmx-map-parser).
A parser for [Tiled Map Editor](http://www.mapeditor.org/) \*.tmx files.

## Installation

```sh
pnpm i parse-tmx
```

## Usage

The basic implementation:

```ts
import { parseTmx } from "parse-tmx";
// The *.tmx file can be loaded as a string or URL encoded data.
// for Webpack use 'url-loader' plugin, for Rollup it can be '@rollup/plugin-url'
import tmxFile from "map.tmx";

// Translates the tile flips in the layer data (default: false)
const translateFlips = true;

const loadMap = async () => {
  const data = await parseTmx(tmxFile, translateFlips);
  console.log(data);
};
```

### Important

Parser only supports embedded tilesets. At the moment, external tilesets are not supported!

## Example data

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

## License

[Apache-2.0 licensed](../../LICENSE).
