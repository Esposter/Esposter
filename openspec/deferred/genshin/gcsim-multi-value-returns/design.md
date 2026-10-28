# Gcsim multi-value returns

The kits pipeline turns each character's gcsim Go source into the kit records the world plays from. Its reader takes a named value by its name, either a package constant or gcsim's own literal, and it has no step for a Go function that returns several values at once. Aino's burst is the one place that reaches a kit field: `tickrate, radius, icdGroup, icdTag := c.a1BurstEnhance()` (`{data-root}/cache/gcsim-v2.47.2/internal/characters/aino/burst.go:31`) binds the cooldown tag her burst's attack carries, so the tag reaches the reader as a bare identifier it cannot resolve.

The water ball's frame, the first tick plus its ten frames (`burst.go:15` and `:64`), would reach the kit through the named-hit join of that attack. The join does not complete for the burst, so the overlay carries the frame as an `Unsourced` sum in the meantime, with both its parts cited in the [Aino design](../../../specs/genshin/kits/aino/design.md).

**Why deferred:**

- Only one reader path is affected. A multi-value binding reaches a field the reader reads only for Aino's burst. Flins's `c4A4`, Heizou's `c6`, Sethos's `a1Calc` and Yaemiko's `revelationEnhanceDMG` return several values too, but their bindings reach no kit field, so a general resolver has no second consumer yet.
- The return is chosen at runtime. `a1BurstEnhance` returns `ICDTagElementalBurst` or `ICDTagAinoBurstMoonHit` by Moonsign level (`{data-root}/cache/gcsim-v2.47.2/internal/characters/aino/asc.go:9-12`). Resolving either alone is a silent guess, so the fix must carry both as branch alternatives through the reader's `withBranch`, which changes how cooldown tags resolve.
- The step that drops the burst attack is not yet traced. The writer refuses an unmapped tag by name, but the Aino dry run succeeds today, so the attack does not reach that writer through the water ball's join. A fix built before that step is found would be a guess.
- A rewrite of the reader is not warranted. Name-based resolution covers every value the kits read, and this is one return form.

**Revisit when:** a second character's kit needs a gcsim value that only a multi-value return gives, or gcsim's tag moves and its Aino source changes, leaving the overlay's cited parts stale.

**Cheaper interim:** the overlay entry `hits.waterBall.hitmarkFrames` is already `Unsourced` at 133, its two parts cited in the Aino design. The frame is right against gcsim; only its provenance is a sum rather than one gcsim line.

## Key files

| Path                                                                          | Role                                                                                                                             |
| :---------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/src/services/genshinAssets/kits/gcsim/readGcsimAttacks.ts`           | Reads each attack literal's fields by name, resolves its cooldown tag (`resolveCooldownTag`), and places branches (`withBranch`) |
| `scripts/src/services/genshinAssets/kits/gcsim/toGcsimInternalCooldownTag.ts` | Maps a gcsim cooldown tag to the kit's, and refuses one the kit has no tag for                                                   |
| `scripts/src/services/genshinAssets/kits/gcsim/getGcsimNamedHitCandidates.ts` | Joins a talent variable's attack to its multiplier, the join the water ball's frame would arrive by                              |

## Sources

- gcsim v2.47.2, Aino's character source: `{data-root}/cache/gcsim-v2.47.2/internal/characters/aino/`, `burst.go` lines 15, 31, 38 and 64, and `asc.go` lines 8 to 12.
