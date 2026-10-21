# Generators

Read when writing a generator, a per-vertex or per-frame loop, or the bench that proves its cost.

- **A generator is pure and seeded, and returns typed arrays**: `computeX(options)` does the work with no three.js object per vertex, and `createXGeometry` only wraps its arrays in a `BufferGeometry`. The `compute*` function is what is tested and benched.

- **Nothing allocates per vertex or per frame.** Write into the output buffer by index, and pass a writer (`writeColor(colors, offset, …)`) rather than returning a tuple.

- **Every generator and per-frame selection is benched at two scales or more**, under the `bench` skill, and its cost must follow what is drawn, never the size of the world.
