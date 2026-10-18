# math-expression-compiler

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Math expressions compiled once into a function of plain numbers, in mathjs's numeric language and held to mathjs's recorded answers. A formula is parsed into a tree, the tree is compiled into a function of its variables' values, and that function is called once per row with no parsing or lookup per call.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i math-expression-compiler
```

```ts
import { compileMathExpression, parseMathExpression } from "math-expression-compiler";

const { value } = parseMathExpression("col0 * (1 - col1)").match(
  (node) => ({ value: compileMathExpression(node, ["col0", "col1"]) }),
  (error) => {
    throw error;
  },
);

value([10, 0.25]); // 7.5
```

| Export                      | What it does                                                                                                                   |
| :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `parseMathExpression`       | A formula to its tree, or a `Result` holding the first error with its position                                                 |
| `compileMathExpression`     | A tree and its variable names to a function of the variables' values, which yields `NaN` where a formula has no numeric answer |
| `getMathExpressionNames`    | The names a tree reads that it does not assign itself and that are not constants                                               |
| `MathExpressionFunctionMap` | Each function of the language by its mathjs name, with its arities and its computation                                         |
| `MathExpressionConstantMap` | The named constants of the language                                                                                            |
| `MathExpressionError`       | The error a parse returns                                                                                                      |

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs) to level up.

## Commands

| Command          | What it does                             |
| :--------------- | :--------------------------------------- |
| `pnpm build`     | Builds `dist` and regenerates the barrel |
| `pnpm test`      | Runs the tests                           |
| `pnpm lint:fix`  | Lints the package and fixes what it can  |
| `pnpm typecheck` | Typechecks the package                   |

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/math-expression-compiler/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/math-expression-compiler/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/math-expression-compiler/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/math-expression-compiler.svg
