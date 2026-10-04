# Solve, not search

Read when choosing how a separable unknown is answered, or before any search is run: the ladder from the most exact query down, and why a global search is never on it.

## The ladder

1. **The exact value, read.** The source holds it: a transform, a material's value, a curve, a rect, a pointer in a script's bytes. A reader returns it, and a test holds the reading.
2. **A closed-form solve from known quantities.** The unknown follows from values already exact: a camera's focal length and distance from the pixel widths of parts of known size, its pose from four or more points whose places in the world are known, a light's colour by least squares once the surface's albedo and normal are known per pixel. The solve prints its residual.
3. **A local refinement from that solve.** A few steps of a gradient method or a simplex from the closed form, over a cost that only this unknown moves (an edge distance over one layer's mask, a residual over one region), to absorb the noise the closed form assumed away.
4. **A fitted generator**, where the unknown is a shape or a texture rather than a number: our own code produces it, and a fit sets its parameters against the exact data, printing its error where the reference shows it.

A step lower on the ladder is taken only when the one above has no data to read. Each step's result is the next step's starting point, never a replacement for it.

## Why a search is never the tool

A search over a whole-frame score (a grid of poses, a sweep of a light) finds the minimum of every unknown's error at once. Its answer is the setting that best hides whatever else is wrong: a wrong scale becomes a wrong distance, a missing texture becomes a brighter light, a missing layer of clouds becomes whichever pose shows the most clutter. So a good score from a search proves nothing, and a pass that tunes on it moves further from the source while the number improves.

A camera is the usual case: a grid of poses scored on the frame absorbs a wrong arrangement into a plausible pose, where perspective from one part of known width gives the pose in closed form and a single render checks it. Before any search, ask whether the source already holds the answer — a printed scene tree shows an arrangement at once.
