# Unity IL2CPP and .NET builds

Read when a target may be a Unity build: its engine markers, the metadata magic and versions, and what a protected build leaves unreadable.

## Engine markers

An IL2CPP build on Windows has a `GameAssembly.dll` at its root and a `<Game>_Data/Managed/Metadata/global-metadata.dat`. A Mono build has managed `.dll` assemblies in `<Game>_Data/Managed/`. An IL2CPP metadata file begins with the four bytes `af 1b b1 fa` (the magic `0xFAB11BAF`, little-endian), so its first bytes say whether it is one before any tool reads it.

## Which engine, which command

| What the target has                                                 | Engine                             | Command                                                                                                        |
| ------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| A metadata file that begins `af 1b b1 fa`, and a `GameAssembly.dll` | IL2CPP                             | `inspect-il2cpp-metadata <file> --binary <GameAssembly.dll>`, which also links each method to its code address |
| A metadata file that begins with any other bytes                    | Protected, or not the Unity format | `inspect-il2cpp-metadata` refuses it as `unrecognized-magic`, and that refusal ends the question for the file  |
| Managed `.dll` assemblies                                           | .NET or Mono                       | `compare-managed-members`, and REA's managed-code guide for CIL                                                |
| A native executable and no metadata                                 | Native                             | Needs Hopper, Ghidra or IDA, none installed                                                                    |

Without `--binary`, the inspector lists names, types, methods and string literals from the metadata alone.

## Versions

REA decodes metadata versions 24, 27, 29, 31 and 39, which the README ties to Unity 2019.4, 2020.3, 2022.3 and 6000.4 builds it checked. Other versions are refused as unsupported, and the version is the number in the file's own header.

## Protected builds

A refusal with `unrecognized-magic` is final for that build. The IL2CPP dumpers (Il2CppDumper, Il2CppInspector) need the same inputs, a metadata file in the standard form and the native binary, so neither is installed: one is worth installing only for a target that has both. The repo's fallback for a protected build is the published dummy-script dump of an older build, used only where its field order still holds (`openspec/specs/genshin/game-data-formats/design.md`, "Scripts").
