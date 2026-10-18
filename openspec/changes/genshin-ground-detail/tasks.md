## 1. Each surface's detail at its own texture's scale

- [ ] 1.1 Measure each surface's detail at its own texture's metres per texel and remove the shared constant. Verify: a test named after the scenario "A base-map surface's detail reads at its texture's texel size", written first and seen failing.
- [x] 1.2 Read the Ground's structure with its layers drawn in the surface pass, and record its reading in the pass's snapshot. Verify: the surface pass's snapshot records the Ground's structure with its layers drawn, missing its gate by a wide margin.

## 2. Windrise's layers

- [ ] 2.1 Decide how the layers' weights reach the terrain material: as vertex attributes morphed with the colour, or as the detail of the layer weighing most. Verify: the chosen option is recorded before task 2.3 starts, and this task decides nothing on its own.
- [ ] 2.2 Export Windrise's splat layers' diffuse textures and fit each layer's detail at its repeat over its width. Verify: a test named after the scenario "A splat layer's texture repeats at the tile's repeat", written first and seen failing.
- [ ] 2.3 Draw the terrain's detail from the layers by their weights, using the option chosen in 2.1. Verify: a test named after the scenario "A terrain point blends its layers' detail by their weights", written first and seen failing.

## 3. The other regions

- [ ] 3.1 Export each other region's base maps and build its ground in its own layers, its field from its tiles' cells and its colours from its base maps. Verify: a test named after the scenario "A region's ground shows its own layers' detail", written first and seen failing.
- [ ] 3.2 Confirm the base map adds no detail of its own to a ground. Verify: a test named after the scenario "The base map adds no detail of its own to the ground", written first and seen failing.
