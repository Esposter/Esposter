# Login

## Queue

- [ ] `[page]` {login-light-shadows} needs game-exports, parity-page — **Login: the light pass, its shadows read for the first time.** `pnpm -C scripts genshin:parity passes login --pass Light`. Reads `{data-root}/genshin-parity/references/login-door-session.png` (from [the session-2 recording](../character/design.md) at 35.9 s), `{data-root}/genshin-parity/extracted/login/` and the `login/stoneLight` record. Writes the night's shadow image, outside the repository, and prints the readings. Bar: `login-door-session shadow edges` within 2 px, the night's light as the scene sets it; `stone colour` reads as before, 15.1 ΔE against its gate; its `glow colour` and `glow structure` terms, per family, are read against the reference's frame (`measureGlow`) and join the bar. Released past Surface's red structure rows: its measure reads each family's unlit colour, which holds, never their fine structure. — waits on the night shadows' casters and softness: their strength and bias are fitted and the light's direction is solved, and the 23.35 px edge gap left is what no further direction solve moves.
- [ ] `[page]` {health-notice-japanese} — **The Japanese PC client's health notice compared in its own words.** `pnpm -C scripts genshin:parity compare health-notice-japanese`, its frame from the Japanese opening's recording at 30 seconds (see Reference), read by the user's eyes. Its measure: the visual suite shows the notice whole, with the PC watermark outside the region.

## Waiting

## Reference

- The Japanese client's opening, found on YouTube at https://www.youtube.com/watch?v=57d2PwbOdr0, is read by this page (see Open for its recording).

## Open

- [ ] **Login: the stone colour at 15.1 ΔE against its gate** — no source yet: a light-pass reading of the stone's colour, which the login snapshot does not hold.
- [ ] **Login: the 23.35 px shadow-edge gap left** — no source yet: a recorded light-pass reading of the night shadow edges, which no snapshot holds.
- [ ] **The Japanese client's opening is read by this page** — no source yet: the Japanese opening's recording from YouTube, which is not on disk; `{data-root}/genshin-parity/captures/localized-opening-japanese.mkv` is not confirmed as that recording
- [ ] **Login: the night shadow image the light pass writes** — no source yet: a run of the light pass, since the night shadow image it writes is not on disk
