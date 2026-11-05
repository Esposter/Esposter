# Genshin reproducible pipeline

## Why

Phase 0 (Foundation) of the Genshin recreation needs its conversion pipeline to give the same result on a fresh PC and Mac pair. It does not yet. No export records the game version or the converter binary that wrote it, the Windows converter is unpacked by hand, two sources are read from branches that move, the macOS and Windows decoders are not shown to agree, and several outputs hold the path of the machine that wrote them. The phase's exit gate is that a fresh pair reproduces every published dataset and fit from the install, and nothing in the repository can yet show that it does.

## What Changes

The conversion pipeline's outputs are reproducible from the installed game on a fresh PC and Mac pair.

- Every export, fit input and record gets a provenance stamp naming the game version, the tool and its hash, the operating system and the command. A fit, the map and the fleet copy refuse an input whose stamp names another version or has none.
- Every fetched source is pinned to a commit, and every tool a stage runs is installed from a pinned archive checked by its SHA-256 and found on no `PATH`.
- Exports and records hold paths relative to the data root, and each record has exactly one writer.
- Fits write their records and reports and never a file a person edits. A refit refuses an input that changed since its report was made.
- A re-extraction clears what its writer owns, the fleet copy compares content rather than size and time, and the lock check compares the generated lock with the committed one.
- The macOS decoder is accepted only when its file counts match the Windows counts, the game-running guard works on macOS, and every hand-set or measured value names the capture it came from.

**BREAKING**: exports, fit inputs and records made before this change carry no stamp, so the fit, the map and the fleet copy refuse them until their writers run again. The old `producer.json` form is deleted rather than read beside the new one.

## Capabilities

- **genshin/reproducible-pipeline** (new)

## Waiting on

None.

## Impact

The asset conversion scripts under `scripts/src/services/genshinAssets`, the parity and text commands, the Windows and macOS AnimeStudio build, the fleet copy and the lock check, and the parity folder's records and measurement files. The change needs the game install, and the Windows CLI build and the reproduction run need the PC.
