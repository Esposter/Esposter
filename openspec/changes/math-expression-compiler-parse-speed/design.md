## Context

The [language design](../../specs/math-expression-compiler/language/design.md) holds the package to mathjs's values, and its parse to time in step with the formula's length. Both hold. What this change answers is the one place the package is still slower than the library it replaces.

### Against mathjs today

The package's built output against mathjs at the version the parity record was taken from, each formula parsed and compiled once and evaluated once:

| Formula                                              | Against mathjs                                                                                                               |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Groups nested tens deep, plain or behind a division  | Level, both well under a millisecond                                                                                         |
| Groups nested behind a percent sign                  | Ahead: under a millisecond at any depth, where mathjs doubles per level and takes over a tenth of a second by the high teens |
| `sum` or `hypot` of a few hundred thousand arguments | Ahead: mathjs overflows its stack and gives no answer                                                                        |
| `count` or `max` of a few hundred thousand arguments | About a fifth slower, each a few tenths of a second                                                                          |
| The parse alone, of a few hundred thousand arguments | About a tenth slower                                                                                                         |

A sheet formula is rarely long, so no reader waits on the gap today. It is closed because the package was written to shed mathjs's costs, and this is the one row where it carries more than mathjs does.

### Where the time goes

A CPU profile of the parse of a sum of a few hundred thousand ones puts about a quarter of the time in the rule dispatcher, `parseMathExpressionRule`, about a tenth in `getOwnValue`'s operator lookups, and about a quarter across the tokenizer: the delimiter read, the number read, the character read and the digit regular expression. Each binary level is about one percent of its own, and there are ten of them. None of it is one slow line. An operand enters assignment, the conditional and then ten binary levels before it reaches the implicit product, and each level dispatches through the map and looks the token up in an operator map that does not hold it.

## Decision: one climbing rule for the ten binary levels

The levels from logical or down to multiplication become one rule, `parseBinary`, over one table that gives each binary operator's token its binding power and what it builds: a function name for a binary node, a logical operator for a lazy logical node, or a comparison. The rule parses an operand at the implicit product, then, while the next token is an operator whose power is at least the minimum it was called with, takes the operator and parses its right side by calling itself at one power higher, which groups `a - b - c` as `(a - b) - c`. A comparison collects the chain as `parseRelational` does now, each operand parsed one power above the comparisons, so `a < b < c` stays one comparison node. The conditional parses its operands through `parse(state, MathExpressionGrammarRule.Binary)`, which climbs from the lowest power.

The rule calls itself, which is not an import, so `import/no-cycle` and one function per file both hold. The postfix percent sign is consumed beneath the implicit product, as now, so a `%` the climbing loop sees is always a modulo and needs no lookahead of its own.

Options considered:

1. **Precedence climbing over a binding-power table.** Chosen. An operand costs one call into the binary operators and one table lookup per operator, whatever the precedence of the operator that follows.
2. **Per-level recursion, kept and shaved**: the dispatcher inlined, a `Set` per level, the levels calling each other directly. Rejected: the twenty calls per operand are the cost, and inlining them means rule files importing each other, which is the cycle the map exists to break.
3. **One function per level written as a hand-tuned switch.** Rejected: it is the same chain with the table moved into code, and it breaks one function per file.

`parseLeftAssociative` is left with nullish coalescing as its only caller, so it folds into `parseNullish`, as a helper with one caller does. `MathExpressionOperatorMap` keeps the unary, power and nullish entries that the remaining rules and `checkIsUnaryStart` read, and the binary entries move into the climbing table, so each operator is still written once.

## Decision: the tokenizer compares characters

`DIGIT_REGEX` is tested once per digit of every number, and `WORD_START_REGEX` and `WORD_CHARACTER_REGEX` once per character of every name. A digit becomes a comparison of its character code against the codes of zero and nine, and an ASCII letter, underscore or dollar sign the same. The regular expressions stay for a character outside ASCII, since a name may hold any letter, so the language and its errors are unchanged.

`takeMathExpressionMatching` builds its result one character at a time. It becomes a scan that advances the index and returns one slice from where it started. `readMathExpressionDelimiter` slices three, two and one characters on every read and looks each up; it reads the first character, and only when that character can begin a longer operator does it look at the next.

Rejected: tokenizing the whole formula into an array up front. The parser reads one token ahead and, for the division and percent choices, two, which the cursor already serves; an array holds an object for every token of a formula of hundreds of thousands, where the stream holds one at a time.

## The bar

The change ships when every row of the table above is level with mathjs or ahead of it, measured the same way, and when the parity test, the parser suite and the app's `compileMathTransformation.test.ts` pass unchanged. The [parse bench](../../../packages/math-expression-compiler/src/services/parser/parseMathExpression.bench.md) is rerun and committed with the change, and the commit body states the before and after of both the bench and the comparison.

mathjs is no longer a dependency, so the comparison runs against a copy outside the workspace: `pnpm add --ignore-workspace mathjs` at the version the parity record names, in a scratch folder, and a script that imports both that copy and the package's built `dist`, times a parse and compile of each formula in the table and prints the two side by side. The script is not committed, since nothing in the repository may import mathjs, and the committed number is the parse bench's.

## Key files

Every path starts at the repository root.

| File                                                                                         | Role                                                                       |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `packages/math-expression-compiler/src/services/parser/rule`                                 | The rules: ten binary levels go, the climbing rule comes                   |
| `packages/math-expression-compiler/src/models/parser/MathExpressionGrammarRule.ts`           | The grammar's rules, the ten binary levels replaced by one                 |
| `packages/math-expression-compiler/src/services/parser/MathExpressionRuleParserMap.ts`       | Map: each rule to its parser                                               |
| `packages/math-expression-compiler/src/services/parser/MathExpressionOperatorMap.ts`         | The unary, power and nullish operators that stay beside the climbing table |
| `packages/math-expression-compiler/src/services/parser/parseLeftAssociative.ts`              | Folds into the nullish rule, its last caller                               |
| `packages/math-expression-compiler/src/services/parser/rule/parseConditional.ts`             | Parses its operands at the climbing rule                                   |
| `packages/math-expression-compiler/src/services/parser/token/constants.ts`                   | The character expressions, kept for characters outside ASCII               |
| `packages/math-expression-compiler/src/services/parser/token/takeMathExpressionMatching.ts`  | A scan and one slice                                                       |
| `packages/math-expression-compiler/src/services/parser/token/readMathExpressionDelimiter.ts` | An operator's length read from its first character                         |
| `packages/math-expression-compiler/src/services/parser/parseMathExpression.bench.ts`         | The parse bench whose report the change reruns                             |
| `openspec/specs/math-expression-compiler/language/design.md`                                 | The rule chain, its diagram and the one-file-per-rule decision, rewritten  |
