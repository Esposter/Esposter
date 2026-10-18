# Math Expression Compiler

## Why

A sheet's math column evaluates a formula over its source columns, and mathjs is the engine under it. The column uses a sliver of that engine — numbers, arithmetic, comparisons and a few dozen numeric functions — while the engine's product is everything else: units, matrices, complex numbers, big numbers, fractions and symbolic algebra. The column's schema is shared with the browser, so the whole engine ships to every sheet editor as one of the app's heaviest client dependencies, for a parser a page of code could hold.

The compute around it pays per cell for work that changes per column. mathjs parses the formula again for every cell, each source column is searched for again, a regular expression is rebuilt, and in the grid each aggregation cell walks its whole source column, so sorting by one reads the sheet once per comparison.

Three defects ride along. A cycle of math columns shows numbers, because the cycle guard hands the column an empty source and a math column reads one as zero. A comparison is documented as supported, but mathjs answers one with a boolean, which the column turns into an empty cell; only a comparison inside a conditional ever showed a value. And the parse check runs inside the stored content schema, which the server applies to every read and every patch of a sheet, so an expression any future parser refused would make the whole sheet impossible to open.

## What Changes

- A new package, `math-expression-compiler`, holds a math expression parser and a compiler over plain numbers that reads every formula mathjs reads to a number the way mathjs reads it — its precedence, implicit multiplication, percentages, floored modulo, rounding, numeric functions and the functions that read flat lists of numbers — proved against a committed record of mathjs's own answers, so no formula a math column holds changes its value. It is a package rather than part of `@esposter/shared`, which every app and package imports, because it nearly doubles that bundle for the one consumer that evaluates formulas.
- Every mathjs defect in that part of the engine is fixed, each with a regression test naming its issue.
- A comparison or a logical operator yields one or zero, so a bare comparison shows a value instead of an empty cell.
- A sheet's computed columns are compiled once per pass over its rows rather than resolved per cell, each aggregation is built once over its source, and a cycle is found at compile time, so every column on it shows empty cells.
- The expression is checked in the column's edit form, which also names a column variable the expression reads before anything binds it. The stored schema no longer parses it, so a stored expression the compiler cannot read leaves its column empty and never stops the sheet opening.
- mathjs leaves the catalog, the app's manifest, the pre-bundle list and the dependency register.

## Capabilities

- **math-expression-compiler/language** (new)
- **resource/sheet/computed-columns** (modified)

## Waiting on

None.

## Impact

- `packages/math-expression-compiler`: the parser, the compiler, the function and constant tables, their models, the parity corpus and the package's bundle size snapshot.
- `packages/shared`: the code it held for a day moves out, and its bundle size snapshot returns to what it was.
- The sheet's math transformation schema and its edit form schema.
- The computed column compute and every pass over a sheet's rows that reads it: the grid's row store, the filters, the statistics, the outliers, the clipboard and the dataset a dashboard reads.
- The computed columns design, which describes the expression language.
- The workspace catalog, the app's manifest and Vite pre-bundle list, the lockfile and `.agents/ledgers/dependencies.md`.
