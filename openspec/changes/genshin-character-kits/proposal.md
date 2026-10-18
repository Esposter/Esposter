# Character kits

## Why

Every character in the character kits index has a module of its own, and the framework those modules run on is built. Characters without a module fight with the Traveler's kit, and several modules still lack what the game gives them: the Traveler's element, the passives and constellations the modules leave out, the swap effects that end when a character leaves the field, Hu Tao's Spirit Soother heal, and Nefer's kit, which no reference project has. Other systems that act through a kit wait on these, so this change comes before them.

## What Changes

Each playable character fights by its own kit, with its passives, its swap effects and its rolls.

- The Traveler's skill and burst deal the element of the Statue of The Seven the Traveler has resonated with.
- Each playable character without a kit of its own gets one; Nefer's kit is built from her game records.
- Each passive takes effect at the ascension phase its character's talent table names.
- Hu Tao's Spirit Soother heals when the healed character's HP is under half.
- Klee's Sparks 'n' Splash, Xiao's Bane of All Evil, Ningguang's Star Jades and Razor's Wolf Within end when their character is swapped off the field; Xingqiu's Raincutter follows once its delay is read.
- Klee's Explosive Spark and Yelan's Breakthrough Barb are rolled as each hit strikes.
- CI refuses a world build whose entry is over its size ceiling.

## Capabilities

- **genshin/character-kits** (new)

## Waiting on

- `openspec/changes/genshin-statues-of-the-seven/`: the statue resonance that picks the Traveler's element and set.
- Game exports, which the change needs before its records can be built.
- Talent names and descriptions, which are read by their text ids once the game text is available.

## Impact

- The Genshin world's combat kits: each character's module, the Traveler's kit, the kit events and the rolls a hit can draw.
- The world build's size check.
- Three choices are open and recorded as decisions before their build: Amber's Fiery Rain arrow area, the periodic discharge lists, and Go's float division in the kit reader.
