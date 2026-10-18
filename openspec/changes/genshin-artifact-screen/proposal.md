# Artifact screen

The roadmap's question was whether the artifact roll and enhance path, which nothing in the world reads, is deleted or
read back. The path returns. Artifacts are basic Genshin, and the chest drops are being wired to roll them, so the
character screen has to wear, unwear and enhance them.

This change reads the two tables a worn artifact's enhancement needs into the world's stat tables, adds the services
that equip, unequip and enhance a character's worn artifacts, and reads a character's set bonuses active at two and four
pieces through one reader. The Artifacts tab's panel, the bag's artifact entry and equipping from and unequipping to the
bag are not built here: the bag's artifact entry is the character-screen agent's change, which the coordinator cherry-picks,
and this change builds against the `Artifact` type it uses.
