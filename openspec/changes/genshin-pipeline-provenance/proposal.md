# Genshin pipeline provenance

## Why

The conversion pipeline from the installed game writes exports, fit inputs and records that nothing traces back to the game version, the tool or the commit that made them. No export records the game version or the converter binary that wrote it, some sources are read from branches that move, the Windows converter is unpacked by hand, and some tools are found on the `PATH`. A fresh PC and Mac pair therefore cannot show that it reproduces an output, and a consumer has no way to refuse an input it cannot vouch for.

## What Changes

Every export, fit input and record carries a provenance stamp naming the game version, the tool and its hash, the operating system and the command. A fit, the map and the fleet copy refuse an input whose stamp names another version or has none. Every fetched source is pinned to a commit, and every tool a stage runs is installed from a pinned archive checked by its SHA-256 and found on no `PATH`.

**BREAKING**: exports, fit inputs and records made before this change carry no stamp, so the fit refuses them and the map is made again until their writers run again, and the fleet copy copies them, since it refuses only a stamp of another game version. The old `producer.json` form is deleted rather than read beside the new one.

## Capabilities

- **genshin/pipeline-provenance** (new)

## Waiting on

None.

## Impact

The asset conversion scripts under `scripts/src/services/genshinAssets`, the text and kits sources, the shared tool installs, the ffmpeg, vgmstream and vkd3d stages, the fleet copy's refusal and the lock writer. The Windows CLI build needs the PC and the decoder constants need the game install, and the other tasks name no machine.
