# Interaction

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {interaction-pill-right} needs game-exports, media-engine, parity-page — **Interaction: the pill's right end and the selection's move, read off a clean pickup.** `pnpm -C scripts genshin:parity compare interaction-prompts-jueyun-chili`, its reference re-cut from `captures/yt-UBNImta_dWs-prompt-scroll.mp4`, the near one found for `prompt-scroll.mkv`, at 22 seconds: three Jueyun Chili rows over plain grass, the third selected, so the pill's right end stands clear of the scene; at 3.5 seconds the list is scrolled to its last row. Reads that clip and writes nothing; its region's mean difference is the bar, 2%. — missed at 5.07% (7.98% at HEAD's pill, FLIP 0.2144 from 0.3158; shape 0.949): the reference is `interaction-prompts-jueyun-chili`, the clean frame at 23 seconds, so `compare interaction-prompts-pickup` keeps its own world-pickup reference and 8.93%. What holds it: the pill's ground and rim are drawn from the game's pickup, but the item icon is a grey disc standing in for the Jueyun Chili art, and the name's glyphs sit 1 to 2 pixels off the game's; the icon is what the diff lights up, so only the drawn icon moves it further.

## Sources

- `prompt-scroll.mkv` — a pile with more drops than the list has rows, the wheel run from its first row to its last and back, no caption or camera inset over the list, 20 seconds at most. Found 2026-10-11, a near one: https://www.youtube.com/watch?v=UBNImta_dWs at 0–25 s (`captures/yt-UBNImta_dWs-prompt-scroll.mp4`), the English PC client at 1080p and 59.94 frames a second, no caption or inset: a chest's drops, the list scrolled with F's cap to its last row, Hunter's Bow, by 3.5 s and picked up from the bottom, then three Jueyun Chili rows over plain grass at 21–24 s, the pill's right end clear of the scene. It is the 2020 build, and the wheel is not run back up.
