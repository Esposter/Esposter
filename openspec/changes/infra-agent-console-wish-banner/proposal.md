# Wish banner

## Why

The lore pick draws the session's character at random, weighted by the odds the tier returns, and the welcome prints those odds as a bar chart. A wish is the game's own picture of exactly that: a draw from published rates. Showing a session's character as a wish gives the draw a picture and puts the published rates one tap away, and recent picks let the draw remember the characters met before.

## What Changes

A session drawn by lore opens as a wish in the Genshin theme, and the characters met in recent sessions now weigh into the draw.

- The characters met in recent sessions join the state the tier reads for its draw. This part changes the terminal's behaviour too and needs no console, so it ships on its own.
- When a session drawn by lore opens in the Genshin theme, a star falls in the colour of the character's rarity, purple for four stars and gold for five, and resolves into the character's nameplate.
- The banner's details show every character with the probability the tier gave them, the same rows the welcome chart prints.
- A pinned character skips the draw, so the nameplate appears without the fall.

## Capabilities

- **infra/agent-console/wish-banner** (new)

## Waiting on

- The console being mounted again. It is unmounted while the Genshin game alone is running, and the animation and the rates panel wait on it.
- A person's eye on the animation and the rates panel before they are accepted.

## Impact

- The lore draw's state reads the characters met in recent sessions, so the terminal's welcome may pick differently from before.
- The Genshin theme gains a session opening animation and a rates panel once the console is mounted again.

Size kept as the source page's own: splitting it is a later decision.
