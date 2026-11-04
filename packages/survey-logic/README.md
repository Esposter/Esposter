# survey-logic

[![Apache-2.0 licensed][badge-license]][url-license]

It parses and evaluates the survey's expression language: the conditions that show, enable or require a question, the calculated values and the validators, written over a survey's answers. It is checked against SurveyJS's recorded answers with every deliberate difference listed.

The package has no live SurveyJS. It does not depend on SurveyJS, and the values it is held to were recorded from SurveyJS's expression runner into fixtures that its tests replay.

Design notes live in [the survey logic design](https://github.com/Esposter/Esposter/blob/main/openspec/specs/resource/survey-logic/design.md).

## Table of Contents

- 🧩 [Key Exports](#key-exports)
- 🧮 [Functions](#functions)
- ⚖️ [License](#license)

---

## <a name="key-exports">🧩 Key Exports</a>

| Export                                                                                        | Kind     | Purpose                                                                                                                                              |
| :-------------------------------------------------------------------------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkSurveyExpression`                                                                       | function | Refuses an expression that does not parse, calls a function the package lacks, or calls an array function's filter form, naming the first such fault |
| `evaluateSurveyExpression`                                                                    | function | Evaluates a parsed expression over the context's answers                                                                                             |
| `MAX_SURVEY_EXPRESSION_LENGTH`                                                                | constant | The most characters an expression source may hold; a longer source is refused at its first character past the limit, and nothing throws              |
| `parseSurveyExpression`                                                                       | function | Parses an expression's source into its tree, or into the first fault with the character position it starts at                                        |
| `runSurveyExpression`                                                                         | function | Parses a source and evaluates it over a context already read as answers, or returns the parse's fault                                                |
| `SurveyExpressionNode`                                                                        | type     | A parsed expression, each node told apart by its `type`                                                                                              |
| `SurveyExpressionNodeType`, `SurveyExpressionBinaryOperator`, `SurveyExpressionUnaryOperator` | enum     | The node types and the operators a tree holds                                                                                                        |
| `SurveyLogicContext`                                                                          | type     | What an expression reads: the answers and calculated values, the row scopes, and the clock the caller passes                                         |
| `SurveyLogicError`                                                                            | type     | The message and the character position a parse is refused for                                                                                        |
| `SurveyLogicStoredValue`                                                                      | type     | A value as storage holds it, where a null may appear and reads as unanswered                                                                         |
| `SurveyLogicValue`                                                                            | type     | The values an expression reads and computes, where `undefined` is an empty answer                                                                    |
| `tokenizeSurveyExpression`                                                                    | function | Reads an expression's source into its tokens, or returns the first fault                                                                             |
| `toSurveyLogicAnswer`                                                                         | function | Reads one stored value as an answer at every depth, with a stored null read as unanswered                                                            |
| `toSurveyLogicAnswers`                                                                        | function | Reads a record of stored answers as answers, each at every depth: the one boundary where a stored null reads as unanswered                           |

## <a name="functions">🧮 Functions</a>

Each function is called by its name, written in any case. A call to a name no function has is refused when the expression is checked.

| Function       | Returns                                                                                                                                                                                                                          |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `age`          | The whole years from a birthdate to the clock, or the whole count of the interval it names; undefined for a birthdate after the clock                                                                                            |
| `avg`          | The average of the values passed, arrays flattened                                                                                                                                                                               |
| `avgInArray`   | The average of a field over the items of an array value                                                                                                                                                                          |
| `count`        | How many values are passed, arrays flattened                                                                                                                                                                                     |
| `countInArray` | How many items of an array value hold a value in a field                                                                                                                                                                         |
| `dateAdd`      | A date moved by an amount of an interval, in days by default; a date moved outside years zero to 9999 has no result                                                                                                              |
| `dateDiff`     | The amount of an interval between two dates: calendar days, months or years, or hours, minutes and seconds on the clock                                                                                                          |
| `day`          | The day of the month of a date, or of the clock's day when the date is empty                                                                                                                                                     |
| `iif`          | The second value when the condition is `true`, otherwise the third                                                                                                                                                               |
| `max`          | The largest of the values passed, arrays flattened                                                                                                                                                                               |
| `maxInArray`   | The largest value of a field over an array's items, or another field of that item                                                                                                                                                |
| `min`          | The smallest of the values passed, arrays flattened                                                                                                                                                                              |
| `minInArray`   | The smallest value of a field over an array's items, or another field of that item                                                                                                                                               |
| `month`        | The month of a date, from one for January, or of the clock's day when the date is empty                                                                                                                                          |
| `round`        | The number rounded to a number of decimal places, or to a whole number when the precision is empty or absent. A value that reads as no number has no result, and so does a precision that is not a whole number from zero to 100 |
| `substring`    | The part of a text from a start index up to an end index. A start, or a present end, that reads as no number has no result, and an empty or absent end runs to the end of the text                                               |
| `sum`          | The sum of the values passed, arrays flattened                                                                                                                                                                                   |
| `sumInArray`   | The sum of a field over the items of an array value                                                                                                                                                                              |
| `today`        | The clock's day at midnight, moved by a number of days when one is given                                                                                                                                                         |
| `trunc`        | The number cut to a number of decimal places, or to its whole part when the precision is empty or absent. A value that reads as no number has no result, and so does a precision that is not a whole number from zero to 100     |
| `weekday`      | The day of the week of a date, from zero for Sunday                                                                                                                                                                              |
| `year`         | The year of a date, or of the clock's day when the date is empty                                                                                                                                                                 |

The `...InArray` functions take a field and, optionally, another field of the item to return. A filter, a condition over each item's fields as a last argument, is not supported: `checkSurveyExpression` refuses the call, and `runSurveyExpression` answers empty for it.

The functions that read the live survey object, "displayValue", "isContainerReady", "isDisplayMode" and "propertyValue", are deliberately not implemented, since the package has no survey object to read. A call to one is refused by `checkSurveyExpression` as an unknown function, and `runSurveyExpression` answers empty for it.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
