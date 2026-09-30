# Loss tables

Every scene's last `pnpm -C scripts genshin:parity attribute`, one section per set of references, which it
rewrites. A row is a view of the witness render scored against the references: the line distance (pixels between
the towers' sides, 0 identical), the shape (1 identical), the tone and the detail (0 identical). Its loss is how far
it falls from the witness's own row, the cost of that stand-in. Commit it with the change that moved it, as a
bench's report is.

## `login-dawn`, `login-dusk`, `login-night`

| View | Line distance | Shape | Tone | Detail | Loss: line, shape, tone, detail |
| :--- | ------------: | ----: | ---: | -----: | :------------------------------ |
| witness | 14.41 | 0.239 | 18.07% | 0.88% | 0.00, 0.000, 0.00, 0.00 |
| witness, textures flattened | 14.39 | 0.231 | 18.01% | 0.89% | -0.01, 0.008, -0.06, 0.01 |
| ours: Towers | 12.47 | 0.287 | 20.28% | 0.89% | -1.94, -0.048, 2.21, 0.00 |
| ours: Bridges | 12.91 | 0.245 | 19.28% | 0.90% | -1.49, -0.006, 1.21, 0.02 |
| ours: Walkway | 14.33 | 0.238 | 16.57% | 0.88% | -0.08, 0.001, -1.50, 0.00 |
| ours | 12.55 | 0.286 | 20.61% | 0.90% | -1.86, -0.047, 2.54, 0.01 |
