# Artifact screen

The roadmap's question was whether the artifact roll and enhance path, which nothing in the world reads, is deleted or
read back. The path returns. Artifacts are basic Genshin, and the chest drops are being wired to roll them, so the
character screen has to wear, unwear and enhance them.

This change reads the two tables a worn artifact's enhancement needs into the world's stat tables, adds the services
that equip, unequip and enhance a character's worn artifacts, and reads a character's set bonuses active at two and four
pieces through one reader. The Artifacts tab's panel is built with its slots, the picked artifact's stats, the set bonus
lines and actions; the main stat's value reads its level's curve, and the stats' place is provisional. The bag's artifact entry is the character-screen change's, landed on `eye`, and this change builds against the `Artifact`
type it uses. It also builds the bag moves: equipping from the bag, unequipping to it and fodder taken from it, with the
artifact lock.

## Capabilities

- **genshin/artifact-enhancement** (modified: it gains the requirements for a character's worn pieces, its set bonuses and its enhancing)
