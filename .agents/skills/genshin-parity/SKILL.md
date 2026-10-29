---
name: genshin-parity
description: Apply when building or changing a Genshin screen or scene (loading, login, menus, prompts, HUD, the world) to match the game, tracing a glyph, measuring a reference, extracting or fitting to the game's assets, matching an animation, recreating a piece of its music, or touching packages/genshin-world's or packages/genshin-interface's components, parity page or visual suites, or scripts/src/genshinParity. Esposter's image-driven parity loop for matching the game's screens, scenes and music.
---

# Genshin Parity

The loop and why it is shaped this way are `openspec/specs/genshin/parity/README.md`, and the route a question takes through the game's own files, a shader's port among them, is `openspec/specs/genshin/game-reading/design.md`. This skill is the rules each step follows.

## Settled — do not re-propose

Each direction's full statement, with the pointers it carries, is `references/settled-directions.md`.

- **Committing a reference** — the game's screenshots and recordings stay in `PARITY_DIRECTORY`, never in the repository.
- **Asking the user to record what is published** — a search (wiki, installed game, community dump, public video) comes first, and a value nothing published shows is estimated, never recorded on request.
- **Waiting on the user for a recording, or asking for one** — users do not record for this workflow; a value comes from a still, a public clip or an extracted animation, else a provisional estimate ships.
- **Reading leaked server data, or looking in the client for group scripts** — the community's group scripts come from an unlicensed leak, and the client holds no group script at all.
- **Sending input to the game** — the tool records the game and the user plays, since injected input is botting under the game's terms.
- **Rendering a screen through Nuxt to check it** — the parity page renders a screen on plain Vite, and a Nuxt build per check is too slow.
- **A hand-kept list of screens** — a screen is on the page and in the suite by its `Index.fixture.ts`, never by a list.
- **Shipping or committing anything taken from the game's files** — only the generated text slices are committed; images, audio, models, meshes and tables never are.
- **Decoding the Excel and BinOutput tables through the code metadata** — the only public decoder is pinned to an older patch, so the tables stay the community dump's.
- **Injecting anything into the running game** — the install's offline code metadata may be read, and the running game is never touched.
- **A `genshin-assets` package** — nothing extracted but game text is committed, so such a package would be empty; the packages stay three.
- **Tracing below full resolution** — a trace starts from the source's full resolution and enlarges a small mark before it is traced.
- **Gating the music's noise on how much of a band lies on our partials** — the share cannot separate the lowest band from its neighbour, so the gate runs through the noise solve's masks instead.
- **Masking a note's partials in the noise solve through its voice's whole release** — a shorter mask leaves too few readings, and they decide the solve.
- **Subtracting a synthesis of our own tones before reading the noise** — a note's envelope spreads next to nothing past the partials' clearance, so the noise barely moves.
- **Starting a note's noise between two sample frames** — the loop is then read between samples and loses the top band.
- **Choosing a recorded instrument by its fitted profile** — ranking by harmonics and envelope charges a faint high overtone as much as a loud low one.
- **Carrying a tuning from a recorded instrument's own fit** — each library's mappings already tune its recordings, so a voice keeps the game's fitted tuning.
- **Choosing recorded instruments by the bands alone** — the bands are blind to pitch, so a candidate's pitch must be kept as well.
- **Looking in the sampled render for a pitch loss every recording shares** — the loss was the instruments chosen, not the recordings.
- **Carrying the game's swells in each note's velocity** — a velocity is fixed when its note starts, so the swell goes in each segment's expression.
- **A fixed equaliser over the shipped music, or over a layered mix** — its gains, fitted on one half of a piece, do not hold on the other.
- **A reverb to close what the recorded instruments leave** — the gaps are short of spectrum rather than ring, and a reverb only lengthens what a note already holds.
- **Joining a transcribed note to the one before it at its pitch** — the game's fundamental does not rise at the note's start, so a joined note sits on the wrong part of its decay.
- **Taking a note's level and decay at the frame the voice's median attack predicts** — the first piece then decays too little and loses pitch agreement.
- **A decay per octave of overtones on the synthesizer** — the fit reads the overtones dying faster, yet playing it moves no score.
- **Holding the first piece's pitch with the catalogue's recordings** — solved for pitch alone, none reaches the synthesizer's agreement.
- **Softening a component to match a recording's blur** — the game draws its text crisp, so `compare` softens our shot by the sigma measured on its reference screenshot instead.
- **Pausing the compute queue along with other work** — only the user stops the queue; a feature lane's stop never does.
- **Keeping noise levels past `MUSIC_DECIMALS`** — it moves the listening score by hundredths of a decibel.

## Rules

- **Numbers before looking:** run `pnpm -C scripts genshin:parity compare <reference>` and read the mean and the grid; zoom only on a cell that stands out (`references/compare.md`).
- **An agent approves a screen's image with `genshin:parity approve` once its compare is clean against a stored reference, and fetches a missing reference first** — `references/approval.md`.
- **A screen is built in a fixed order: its reference, its fixture, its component, `compare`, `approve`, then the visual suite** — `references/approval.md`.
- **A screen's load is held to its budget by the load bench**, `pnpm -C scripts genshin:parity load <screen>` (`openspec/specs/genshin/load-budget/design.md`).
- **A landmark or area missing from the extract is looked up in the dump before it is called missing** — its name is searched in `extracted/maps/index.tsv` first, and a mesh the index holds is a name-pattern gap (`references/data-sources.md`).

## Reference pages

- `references/settled-directions.md` — when a proposal matches a `Settled` line and its full statement is needed.
- `references/toolbox.md` — before any pass or round on a screen or scene, and whenever a loop stalls: which tool answers each unknown, pass by pass.
- `references/interface.md` — when laying out, styling, setting text on or comparing a 2D screen.
- `references/glyphs.md` — when a mark, a logo or an element glyph is traced, found as a vector or filled.
- `references/motion.md` — when recording the game, reading a timing off a recording, holding a screen's motion or testing what only a browser plays.
- `references/scene.md` — when deriving, arranging, fitting, lighting or posing a 3D scene, or running a witness solve.
- `references/sound.md` — when a sound effect of the game is found, fitted, played or timed: the audio pass beside the music.
- `references/compute-queue.md` — when a long run is owed with no judgement left in it, or when running one: the compute queue's pages and how a runner takes an item.
- `references/music.md` — when recreating a piece of the game's music, or changing its fit, its player or `listen`.
- `references/data-sources.md` — when a table is missing from the dump, a landmark or area is missing from the extract, a dump field is obfuscated, or a fit or loop publishes its record.
- `references/components.md` — when adding a component, its fixture, or its reference index.
- `references/approval.md` — when approving a screen's images or citing a reference for one.
- `references/deriving.md` — when deriving a screen, a surface or a scene in passes.
- `references/parity-page.md` — when a command renders the world, a frame stalls, or the parity page is served.
- `references/tools-and-estimates.md` — when a loop has not converged, a tool is built or pruned, or a value is estimated.
- `references/compare.md` — when a screen's `compare` score is judged against its target, or its snapshot row is rewritten.
