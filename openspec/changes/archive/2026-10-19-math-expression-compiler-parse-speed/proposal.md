## Why

The package replaces mathjs, and it is level with mathjs or ahead of it everywhere but one place: a formula with hundreds of thousands of arguments. There, under the package's own bench, which runs the package under vitest, a parse of a sum of 300000 arguments is about three times mathjs's, and so is a count of them. Built and run in plain node on the same host, the package was already level with or ahead of mathjs there, so the design records both measures. The cause is the parser's shape rather than any one slow line. Every operand walks the whole precedence chain, about twenty rule dispatches deep, and ten of those rules are binary levels that each look the next token up in their own operator map and find nothing. The tokenizer adds a regular expression test for every character of a number or a name.

## What Changes

- The ten binary levels, from logical or down to multiplication, become one rule that climbs a table of binding powers, so an operand costs one dispatch into the binary operators rather than ten.
- The tokenizer tells a digit and an ASCII word character by comparing character codes, falling back to the regular expression only for a character outside ASCII, and takes a number or a name by its start and one slice rather than a string built a character at a time.
- The delimiter read checks an operator's length from its first character rather than slicing three, two and one characters on every read.

No behaviour changes. The parity record, the parser suite and the requirement that a parse takes time in step with the formula's length all hold unchanged, so there is no spec delta and `skip_specs` is set.

## Impact

- `packages/math-expression-compiler/src/services/parser/rule`: ten rule files go and one climbing rule comes.
- `packages/math-expression-compiler/src/models/parser/MathExpressionGrammarRule.ts`, `packages/math-expression-compiler/src/services/parser/MathExpressionRuleParserMap.ts` and `packages/math-expression-compiler/src/services/parser/MathExpressionOperatorMap.ts` lose the ten levels.
- `packages/math-expression-compiler/src/services/parser/token`: the character checks, the matching take and the delimiter read.
- `packages/math-expression-compiler/src/services/parser/parseMathExpression.bench.md` and `openspec/specs/math-expression-compiler/language/design.md` are rewritten to match.
