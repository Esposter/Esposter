# math-expression-compiler

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Math expressions compiled once into a function of plain numbers, in mathjs's numeric language and held to mathjs's recorded answers.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/math-expression-compiler).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i math-expression-compiler
```

```ts
import { compileMathExpression, parseMathExpression } from "math-expression-compiler";

const evaluate = parseMathExpression("col0 * (1 - col1)").match(
  (node) => compileMathExpression(node, ["col0", "col1"]),
  () => () => Number.NaN,
);

evaluate([10, 0.25]); // 7.5
```

## <a name="key-exports">🧩 Key Exports</a>

| Export                      | What it does                                                                                                                   |
| :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `compileMathExpression`     | A tree and its variable names to a function of the variables' values, which yields `NaN` where a formula has no numeric answer |
| `getMathExpressionNames`    | The names a tree reads that it does not assign itself and that are not constants                                               |
| `MathExpressionConstantMap` | The named constants of the language                                                                                            |
| `MathExpressionError`       | The error a parse returns                                                                                                      |
| `MathExpressionFunctionMap` | Each function of the language by its mathjs name, as the signatures it takes: argument kinds, arities and computation          |
| `parseMathExpression`       | A formula to its tree, or a `Result` holding the first error with its position                                                 |

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=038758
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/math-expression-compiler/latest?color=038758
[url-npm]: https://www.npmjs.com/package/math-expression-compiler/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/math-expression-compiler/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/math-expression-compiler.svg
