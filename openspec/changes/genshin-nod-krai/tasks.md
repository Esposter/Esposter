## 1. Sky and isles

- [ ] 1.1 Draw the regional moon override in Nod-Krai's night sky, with its size and brightness set from the references. Verify: tests named after the scenarios 'The moon looks larger at night in Nod-Krai' and 'Other regions keep the standard moon', written first and seen failing.
      Waits on a measured night reference of Nod-Krai's moon: none is on disk (`captures/nasha-town-night.png` shows a dotted particle ring where the moon is, not its disc), so `NOD_KRAI_MOON` stands at the standard moon's values. The 'larger' scenario is unwritten until a value is measured, and a larger disc waits on the engine sizing the disc by the shape.
- [ ] 1.2 Draw Lempo Isle, Hiisi Island and Paha Isle as separate outlines on the world map, with the Moontide Sea between them. The Moontide Sea's outline is empty today, one of a dozen the [roadmap](../genshin-roadmap/tasks.md) names. Verify: tests named after the scenarios 'Each isle has its own outline on the world map' and 'The Moontide Sea belongs to Nod-Krai'.
      Waits on the Moontide Sea's outline: `catalogue.json` gives it no polygon, nor Dunanna Pit, Dark Side of the Moon or Lunar Highlands, and the catalogue item in [capitals](../../specs/genshin/compute/capitals/design.md) waits on the community repository's polygons for these areas.

## 2. Kits

- [ ] 2.1 Build the dieselpunk kit for ports, towns and Fatui works, and fit its values against its own exports. Verify: a test named after the scenario 'Nasha Town's buildings are riveted iron'.
      Waits on the fit `nod-krai-dieselpunk-fit` in [compute](../../specs/genshin/compute/nod-krai/design.md), which fits the placeholder options to Nasha Town's exports, and on cranes, which the kit does not build yet.
- [ ] 2.2 Build the Frostmoon Scions' kit for enclaves and stone circles, and fit its values against its own exports. Verify: a test named after the scenario 'The Frostmoon Enclave stands among stone circles'.
      Waits on `nod-krai-scions-fit` in [compute](../../specs/genshin/compute/nod-krai/design.md): no export name on the Mac holds the Nuur Stone Circle or the enclave's works yet.
- [ ] 2.3 Read the kits' fitted values from the passes once their inventory pass has read them. Verify: the passes' gates for the Nod-Krai references hold, as `pnpm -C scripts genshin:parity passes` reports them.
      Waits on the Nod-Krai passes in [compute](../../specs/genshin/compute/nod-krai/design.md), each waiting on `nasha-town-location-camera-landmarks` for its camera.

## 3. Statues and build order

- [x] 3.1 Make each Statue of the New Moon a waypoint in exploring. Verify: a test named after the scenario 'A discovered Statue of the New Moon is a waypoint'.
- [ ] 3.2 Build Nasha Town first, then the Frostmoon Enclave, then the other isles. Verify: each area's scenario named in the tasks above passes as its place is built, in this order.
      Waits on 2.1 and 2.2, the kits Nasha Town and the Frostmoon Enclave are built from.
