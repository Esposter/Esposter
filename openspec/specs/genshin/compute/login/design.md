# Login

## Queue

- [ ] `[page]` {login-light-shadows} needs game-exports, parity-page — **Login: the light pass, its shadows read for the first time.** `pnpm -C scripts genshin:parity passes login --pass Light`. Reads `{data-root}/genshin-parity/references/login-door-session.png` (from [the session-2 recording](../character/design.md) at 35.9 s), `{data-root}/genshin-parity/extracted/login/` and the `login/stoneLight` record. Writes the night's shadow image, outside the repository, and prints the readings. Bar: `login-door-session shadow edges` within 2 px, the night's light as the scene sets it; `stone colour` reads as before, 15.1 ΔE against its gate; its `glow colour` and `glow structure` terms, per family, are read against the reference's frame (`measureGlow`) and join the bar. Released past Surface's red structure rows: its measure reads each family's unlit colour, which holds, never their fine structure. — waits on the night shadows' casters and softness: their strength and bias are fitted and the light's direction is solved, and the 23.35 px edge gap left (`packages/genshin-world/src/services/login/scene/LoginSkyStateMap.ts` line 23, where the solve over the door session's shadows leaves their edges 23.35 px from the reference's) is what no further direction solve moves.
- [ ] `[page]` {health-notice-japanese} — **The Japanese PC client's health notice compared in its own words.** `pnpm -C scripts genshin:parity compare health-notice-japanese`, its frame from the Japanese opening's recording at 30 seconds (see Reference). Its measure: the visual suite shows the notice whole, with the PC watermark outside the region.

## Waiting

## Reference

- The Japanese client's opening, found on YouTube at https://www.youtube.com/watch?v=57d2PwbOdr0, is read by this page (see Open for its recording).

## Open

- [ ] **Login: the stone colour at 15.1 ΔE against its gate** — no source yet: a light-pass reading of the stone's colour, which the login snapshot does not hold (`scripts/src/services/genshinParity/passes/snapshots/login.snapshot.md` has no stone row); `pnpm -C scripts genshin:parity passes login --pass Light` must print it.
- [ ] **The Japanese client's opening is read by this page** — contradicted by `scripts/src/services/genshinParity/shared/ParityReferenceMap.ts` line 470: the `health-notice-japanese` reference is the session-2 recording at 12.5 seconds, not the opening's frame at 30 seconds. The capture the localized-opening design names for the opening (`openspec/changes/genshin-localized-opening/design.md` line 39), `{data-root}/genshin-parity/captures/yt-57d2PwbOdr0-opening-japanese.mp4`, is not on disk, and `{data-root}/genshin-parity/captures/localized-opening-japanese.mkv` is on disk but no record ties it to that video; contradicted by `{data-root}/genshin-parity/captures/localized-opening-japanese.mkv` at about 30 s: the opening cinematic with English subtitles, no health notice in frame (0 to 9 s and 28 to 37 s, one frame a second).
- [ ] **Login: the night shadow image the light pass writes** — no source yet: a run of the light pass, since the night shadow image it writes is not on disk; `pnpm -C scripts genshin:parity passes login --pass Light` writes it.
