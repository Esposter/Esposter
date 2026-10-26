---
name: reverse-engineering
description: Apply when analysing a binary, a game install or an application's code at rest, running REA, or reading a Unity IL2CPP or .NET build. Esposter's reverse-engineering toolchain: the pinned REA install in the machine cache, the probe-copy rule for the Genshin install, and what a protected build leaves unreadable.
---

# Reverse engineering

Analysis of a target at rest: its files are read, never run. The game's data reaches the repo through its own extractors (`genshin:assets`, the parity tools), which read assets and tables; this skill covers the code side those do not reach.

## Settled — do not re-propose

- **REA as a workspace devDependency.** Its dependencies include a native terminal binding (`@lydell/node-pty`) and a browser driver (`playwright-core`), which every `pnpm i` and CI runner would build, and no repo code imports it. It is pinned in the machine cache instead (`references/rea.md`).
- **`rea setup` to register REA with an agent.** It writes agent configuration and workflow instructions into the machine, so it runs only on the owner's approval.
- **Analysing the protection layer or the account and network SDKs.** `HoYoKProtect.sys`, `mhypbase.dll`, `rtlbase.dll` and the `Plugins/` SDKs are not targets: the repo's questions are how the game's data and interface work, and none of those components answers them.
- **Decoding a protected metadata file inside an analysis session.** A decoder for the install's wrapper is its own effort with its own design, decided before it is started (`references/unity-il2cpp.md`).

## Rules

- **Analyse a probe copy, never the install.** Copy the file into the cache, analyse the copy, and delete the copy once the question is answered (`references/genshin-install.md`).
- **Read the engine markers before choosing a tool.** The magic bytes, the binaries present and the managed assemblies present decide the engine, by the table in `references/unity-il2cpp.md`.
- **A refusal is that build's answer.** REA's `unrecognized-magic` means the file is not the format it reads; running another command on the same file is a mismatch, not progress.
- **Install an analysis engine only when a target needs it and a named question waits on it.** Hopper, Ghidra, IDA and JADX are not installed; `rea doctor` names what each would need.
- **npm tools install with `--ignore-scripts`.** The static commands run without the native builds their packages would compile (`references/rea.md`).

## Reference pages

- `references/rea.md` — when running REA: its pinned install, the command shape, `doctor`, and which commands read a target at rest.
- `references/unity-il2cpp.md` — when a target may be a Unity build: its engine markers, the metadata magic and versions, and what a protected build leaves unreadable.
- `references/genshin-install.md` — when reading the Genshin install's files: what it holds, what it lacks, and the probe-copy procedure.
