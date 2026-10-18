## 1. Sky and isles

- [ ] 1.1 Draw the regional moon override in Nod-Krai's night sky, with its size and brightness set from the references. Verify: a test named after the scenario 'The moon looks larger at night in Nod-Krai', written first and seen failing.
- [ ] 1.2 Draw Lempo Isle, Hiisi Island and Paha Isle as separate outlines on the world map, with the Moontide Sea between them. Verify: tests named after the scenarios 'Each isle has its own outline on the world map' and 'The Moontide Sea belongs to Nod-Krai'.

## 2. Kits

- [ ] 2.1 Build the dieselpunk kit for ports, towns and Fatui works, and fit its values against its own exports. Verify: a test named after the scenario 'Nasha Town's buildings are riveted iron'.
- [ ] 2.2 Build the Frostmoon Scions' kit for enclaves and stone circles, and fit its values against its own exports. Verify: a test named after the scenario 'The Frostmoon Enclave stands among stone circles'.
- [ ] 2.3 Read the kits' fitted values from the passes once their inventory pass has read them. Verify: the passes' gates for the Nod-Krai references hold, as `pnpm -C scripts genshin:parity passes` reports them.

## 3. Statues and build order

- [ ] 3.1 Make each Statue of the New Moon a waypoint in exploring. Verify: a test named after the scenario 'A discovered Statue of the New Moon is a waypoint'.
- [ ] 3.2 Build Nasha Town first, then the Frostmoon Enclave, then the other isles. Verify: each area's scenario named in the tasks above passes as its place is built, in this order.
