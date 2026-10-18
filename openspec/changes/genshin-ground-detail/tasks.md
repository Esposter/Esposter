## 1. Each surface's detail at its own texture's scale

- [x] 1.1 Measure each surface's detail at its own texture's metres per texel and remove the shared constant. Verify: a test named after the scenario "A base-map surface's detail reads at its texture's texel size", written first and seen failing.
- [x] 1.2 Read the Ground's structure with its layers drawn in the surface pass, and record its reading in the pass's snapshot. Verify: the surface pass's snapshot records the Ground's structure with its layers drawn, missing its gate by a wide margin.
- [x] 1.3 Confirm the Ground's structure reading, then decide scope item 3 of the [design](design.md) on the confirmed reading. Verify: the dump and the decision on scope item 3 are written under this task before task 2.1 starts.
  - Dump, one run of `genshin:parity passes windrise --pass Surface` on 2026-10-18 (Windrise statue by day, the Ground family's mask over the pixels both targets draw it). The statistics are the luminance variance then the band energies at sigmas 1, 2, 4 and 8. The gate pair is the exports' own even and odd block halves, which gives the gate 0.0369. The structure is the exports' family mask against ours, reference [2.94e-4, 1.12e-6, 1.05e-6, 2.94e-6, 6.50e-6] and shot [5.86e-4, 2.74e-5, 1.21e-5, 2.28e-5, 3.57e-5], which gives share 12.10 against that gate.
  - The reading is confirmed as real and not a broken measure: no statistic is zero on either side, so the share is not the all-zero 1.0000 of the earlier snapshot, and the same function returns the exports' own halves at 0.0369. Our Ground carries about twice the reference's variance and five to twenty-five times its band energies, so the shortfall is excess fine detail, not missing detail. The earlier 17.9274 of the pc-detail miss note came from another run and is superseded by this one.
  - Decision on scope item 3: not built. Layers' detail adds energy to the terrain, and the miss is an excess at the fine bands, so layers' detail would widen it. The layers' step waits on the Ground's structure being re-read under the solved octave amplitudes, which needs the game exports (`x-needs`).
- [ ] 1.4 Re-read the Ground's structure under the solved octave amplitudes (8fe537172a) against the game exports, with the same family mask and gate pair as task 1.3. Verify: the new dump and share are written under this task, and the layers' step in task 2.1 is decided on that reading.

## 2. Windrise's layers

- [ ] 2.1 Decide how the layers' weights reach the terrain material: as vertex attributes morphed with the colour, or as the detail of the layer weighing most. Verify: the chosen option is recorded before task 2.3 starts, and this task decides nothing on its own.
- [ ] 2.2 Export Windrise's splat layers' diffuse textures and fit each layer's detail at its repeat over its width. Verify: a test named after the scenario "A splat layer's texture repeats at the tile's repeat", written first and seen failing.
- [ ] 2.3 Draw the terrain's detail from the layers by their weights, using the option chosen in 2.1. Verify: a test named after the scenario "A terrain point blends its layers' detail by their weights", written first and seen failing.

## 3. The other regions

- [ ] 3.1 Export each other region's base maps and build its ground in its own layers, its field from its tiles' cells and its colours from its base maps. Verify: a test named after the scenario "A region's ground shows its own layers' detail", written first and seen failing.
- [ ] 3.2 Confirm the base map adds no detail of its own to a ground. Verify: a test named after the scenario "The base map adds no detail of its own to the ground", written first and seen failing.
