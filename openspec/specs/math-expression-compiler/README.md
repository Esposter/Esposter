# math-expression-compiler

`packages/math-expression-compiler` (npm `math-expression-compiler`) compiles a formula, such as `col0 * (1 - col1)`, into a function of plain numbers, once. The formulas are in mathjs's numeric language, and the package replaces mathjs in the sheet's math column: a formula keeps the value mathjs gave it, and where mathjs's answer is a defect the package gives the correct one, with the cause recorded beside it.

The area has one capability, its [language](language/design.md): the grammar, the function table, the bar each formula is held to and the parity record that holds it. The sheet's use of the package is the [computed columns](../resource/sheet/computed-columns/design.md) capability, which holds the column's stored schema, its edit form's check and the compile of a sheet's computed columns.

## Upstream

The verdicts on mathjs's tracker are in the [language capability](language/design.md#upstream), which holds the parity record they are checked against.
