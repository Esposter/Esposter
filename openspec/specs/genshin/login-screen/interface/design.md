# Login interface

The login page drawn over the scene: the title and its account label, the status row and progress bar, the door's prompt and the four corner buttons, each shown in the stage the [login screen](../README.md) is in. Its pieces are the game's, laid out by [interface layout](../../interface-layout/design.md) and built from [interface library](../../interface-library/design.md) parts.

## How it works

- **The stages set which buttons show.** The title has the notices and exit; the door has settings, repair, notices and exit (packages/genshin-world/src/components/Login/Interface/Index.vue). The door's buttons show 0.3 seconds after the door has formed, and its prompt fades in from one second over 0.3 seconds ([door](../door/design.md); `packages/genshin-world/src/services/login/constants.ts`).
- **The page moves on the game's own clips.** The login page's animation clips are decoded and fitted to keyframes (the `login/interfaceClips` record, `packages/genshin-world/src/generated/gameDataLock.json`). `createLoginInterfaceClipMap` makes them playable once as the interface mounts, by the name the game plays each by (`packages/genshin-world/src/services/login/interface/createLoginInterfaceClipMap.ts`), and `playInterfaceClip` plays them as each stage begins: the white curtain and the page's fade in on arriving, the title's fade in and its fade out on the click, and the page's fade into white on entering, whose end is the `begin` the opening listens for (`packages/genshin-world/src/components/Game/Opening/Index.vue`).
- **The white is the interface's own.** Each piece a clip moves carries its path under the game's page as its `data-clip-target` (`LoginInterfaceClipTarget`, `packages/genshin-world/src/models/login/LoginInterfaceClipTarget.ts`). The white the scene fades up out of and into is therefore the interface's, so a reference showing the scene alone has none.
- **The mainland client marks its own screen.** A Simplified Chinese reader plays mainland China's build and sees its CADPA age rating (12 and over) in the top right corner at every stage, with its build string under the CNREL prefix (`packages/genshin-world/src/components/Login/Interface/Index.vue`, `packages/genshin-world/src/services/login/GameClientVersionTextMap.ts`). The rating's box and colours are measured off a public recording of that client's launch. Its age and notice are traced from it (the `login/ageRating` record, authored in `packages/genshin-world/src/data/login/ageRating.json`, which `genshin:data authored` publishes), and its CADPA is set in a serif (`packages/genshin-world/src/components/Login/Interface/Index.vue`). The build string's revision numbers come from the global build, since no source publishes the mainland's own.

## Tests

`Login/Interface` is shot in each stage as fixture variants (`Index.fixture.ts`) and held to its approved images (`packages/genshin-world/src/components/Login/Interface/Index.fixture.ts`, `packages/genshin-world/src/components/Login/Interface/Index.win32.png`). Its references are the English recording's frames, over which it is compared.

## Key files

| File                                                                                 | Role                                                                             |
| :----------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| `packages/genshin-world/src/components/Login/Interface/Index.vue`                    | Each stage's interface, from `genshin-interface`'s pieces, and its clips         |
| `packages/genshin-world/src/services/login/interface/createLoginInterfaceClipMap.ts` | The login page's fitted clips made playable, by the name the game plays each by  |
| `packages/genshin-world/src/data/login/ageRating.json`                               | The age rating's traced paths, authored, which `genshin:data authored` publishes |
| `packages/genshin-world/src/services/login/InterfaceIconGameTextKeyMap.ts`           | Each interface icon's game text key                                              |
| `packages/genshin-world/src/services/login/LoginStatusStepGameTextKeyMap.ts`         | Each status step's game text key                                                 |

## Open

- [ ] **The rating's box and colours are measured off a public recording of the mainland client's launch** — no source yet: no mainland launch recording is kept in `~/Esposter.noindex/genshin-parity/captures/` or the parity folders.
- [ ] **Its references are the English recording's frames** — no source yet: `Index.reference.ts`, `Layout.reference.ts` and `Motion.reference.ts` do not name the English recording frames they are compared with.
