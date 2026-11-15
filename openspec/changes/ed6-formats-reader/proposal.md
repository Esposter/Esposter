# ED6 Formats Reader

## Why

The Trails in the Sky trilogy (FC, SC and the 3rd) runs on Nihon Falcom's ED6 engine, and no TypeScript library reads its files. The community tools that do are written in Rust, Python, C# and C++, and almost none of them carry a licence this repository can take code from: the useful three are GPL-3.0 and the rest state no licence at all. The formats themselves are small and well understood, though. A probe written for this proposal walked every archive of the owner's PC installs of all three games and decoded every compressed entry with the community's documented two-mode decompressor, with failures only in the uncompressed entries and in a few `._DT` tables of the second game. A reader in TypeScript is therefore within reach, and it is the base any later viewer or modding tool would stand on.

## What changes

A new workspace package, `ed6-formats`, reads the trilogy's PC data from bytes handed to it, in Node or a browser, with no native dependency:

- **Archives.** It lists an `ED6_DTnn.dir` index, finds an entry by its 8.3 name, and returns the entry's bytes from the paired `.dat`, decompressed when they are compressed.
- **Images.** It turns a hidden DDS entry (`._DS`), a raw pixel sheet (`._CH`), a chip sheet composed from a `._CH` and its `._CP` layout, and a font (`._DA`) into RGBA pixels with their size.
- **Scenario scripts.** It reads a scena file (`._SN`) into its functions and instructions, with every line of dialogue decoded to a string.

A command in `scripts` dumps an install through the package, which is how the package is checked against the real data, since no game file ever enters the repository or CI.

## Not in this change

- **A playable runtime, or any recreation of the games.** The package reads files and hands back data. Running the first game natively from the owner's own copy already exists as a static recompilation (its Sources entry), and the games' art, text and music never leave the owner's machine.
- **3D models (`._X2`, `._X3`) and maps.** The only decoder is GPL-3.0 and its author states much of the format is not understood. A reader for them is its own change once this one ships.
- **Writing archives back,** battle and animation scripts (`AS*._DT`), the data tables, and the 3D remake, which runs on a different engine.

## Capabilities

### New capabilities

- `ed6-formats/archives`: the index, the lookup and the decompression.
- `ed6-formats/images`: hidden DDS, raw sheets, chip sheets and fonts as RGBA pixels.
- `ed6-formats/scena`: scenario scripts as functions, instructions and text.

### Modified capabilities

None.

## Impact

One new package and one new `scripts` command. Nothing in the app changes, and no dataset is published.
