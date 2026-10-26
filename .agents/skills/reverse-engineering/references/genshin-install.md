# The Genshin install

Read when reading the Genshin install's files, deciding what a probe copies, or asking whether a file is analysable.

## Location and rule

The install is `C:\Program Files\Genshin Impact\Genshin Impact Game`. Agents only read it: nothing is written there, the game is never launched, and no process is started or stopped. Analysis runs on a copy.

## What it holds

- `GenshinImpact.exe`, 444 MB. There is no `GameAssembly.dll` beside it, and no `UnityPlayer.dll` at the root.
- `GenshinImpact_Data/Managed/` holds only `Metadata/` and `Resources/`, so it has no managed assemblies.
- `GenshinImpact_Data/Managed/Metadata/global-metadata.dat`, 82.7 MB, does not begin with the IL2CPP magic, so REA refuses it (`references/unity-il2cpp.md`). `startup-metadata.dat` sits beside it.
- `GenshinImpact_Data/Plugins/` holds the HoYoverse SDKs and third-party libraries (Rewired, UnityNativeChromaSDK and others). These are not analysis targets (SKILL.md, Settled).
- The protection components at the root are not analysis targets either (SKILL.md, Settled).

## What reads the game's data instead

The repo reads the install through its own code: `genshin:assets` reads the assets and the text maps, and the community's table dump supplies tables the install does not hold (`openspec/specs/genshin/game-reading/design.md`). Shader HLSL goes through the pinned 3Dmigoto decompiler. None of these reads the game's code, which is why a code question starts from this skill.

## Probe copies

1. Copy the one file into `~/Esposter/cache/genshin-probe/`.
2. Run the question against the copy, saving its JSON answer or refusal beside the copy.
3. Delete the copy once the question is answered. The answer stays; the game's file does not.
