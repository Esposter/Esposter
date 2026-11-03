# survey-logic

[![Apache-2.0 licensed][badge-license]][url-license]

It parses and evaluates the survey's expression language: the conditions that show, enable or require a question, the calculated values and the validators, written over a survey's answers. Its answers match SurveyJS's recorded answers for every expression the survey uses.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/resource/survey-logic).

## Table of Contents

- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="key-exports">🧩 Key Exports</a>

| Export                                                                                        | Kind     | Purpose                                                                                                       |
| :-------------------------------------------------------------------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------ |
| `parseSurveyExpression`                                                                       | function | Parses an expression's source into its tree, or into the first fault with the character position it starts at |
| `tokenizeSurveyExpression`                                                                    | function | Reads an expression's source into the tokens the parser reads                                                 |
| `collectSurveyExpressionReferences`                                                           | function | The distinct question names a tree reads, in the order each is first read                                     |
| `SurveyExpressionNode`                                                                        | type     | A parsed expression, each node told apart by its `type`                                                       |
| `SurveyExpressionNodeType`, `SurveyExpressionBinaryOperator`, `SurveyExpressionUnaryOperator` | enum     | The node types and the operators a tree holds                                                                 |
| `SurveyLogicValue`                                                                            | type     | The values an expression reads and computes, where `undefined` is an empty answer                             |
| `SurveyLogicError`                                                                            | type     | The message and the character position a parse is refused for                                                 |

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
