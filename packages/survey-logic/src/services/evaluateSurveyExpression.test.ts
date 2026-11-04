import type { SurveyLogicStoredValue } from "#src/models/SurveyLogicStoredValue";

import { evaluateSurveyExpression } from "#src/services/evaluateSurveyExpression";
import { parseSurveyExpression } from "#src/services/parseSurveyExpression";
import { runSurveyExpression } from "#src/services/runSurveyExpression";
import { describe, expect, test } from "vitest";

// Every expected value below follows this package's rules, not SurveyJS's: undefined is the one absent value, and a storage null reads as undefined.
// A text is read as a number only where an operation needs one. SurveyJS parity is the fixture replay's job, not this file's.
describe(evaluateSurveyExpression, () => {
  const now = new Date(0);

  const evaluate = (source: string, values: Record<string, SurveyLogicStoredValue>) =>
    runSurveyExpression(source, { now, scopes: {}, values }).match(
      (value) => value,
      (error) => error,
    );

  test.each([
    ["a number equals a numeric string", "{a} = 5", { a: "5" }, true],
    ["a number equals a numeric string with a decimal point", "{a} = 5", { a: "5.0" }, true],
    ["a number does not equal a non-numeric string", "{a} = 5", { a: "abc" }, false],
    ["a number does not equal a boolean", "{a} = 5", { a: true }, false],
    ["a boolean equals one", "{a} = 1", { a: true }, true],
    ["zero equals false", "{a} = 0", { a: false }, true],
    ["zero does not equal an empty string", "{a} = 0", { a: "" }, false],
    ["an empty string equals the empty string", "{a} = ''", { a: "" }, true],
    ["an unanswered question equals the empty string", "{a} = ''", {}, true],
    ["an unanswered question does not equal a string", "{a} = 'x'", {}, false],
    ["an unanswered question is not equal to a string", "{a} != 'x'", {}, true],
    ["a string equality ignores case", "{a} = 'x'", { a: "X" }, true],
    ["a string equality ignores case of both sides", "{a} = 'ADA'", { a: "ada" }, true],
    ["two string literals compare as text", "'10' < '9'", {}, true],
    ["a string literal and a number compare as numbers", "'10' < 9", {}, false],
    ["a numeric string literal compares as a number", "'5' > 3", {}, true],
    ["a numeric answer compares with a number", "{a} > 3", { a: "5" }, true],
    ["a non-numeric answer is not greater than a number", "{a} > 3", { a: "abc" }, false],
    ["an unanswered question is not less than a number", "{a} < 5", {}, false],
    ["an unanswered question is not greater than a number", "{a} > 5", {}, false],
    ["an unanswered question is not greater or equal to a number", "{a} >= 5", {}, false],
    ["an unanswered question is not less or equal to a number", "{a} <= 5", {}, false],
    ["an unanswered question is not equal to a number", "{a} != 5", {}, true],
    ["two unanswered questions are equal", "{a} = {b}", {}, true],
    ["two unanswered questions are not unequal", "{a} != {b}", {}, false],
    ["two unanswered questions are greater or equal", "{a} >= {b}", {}, true],
    ["a number is not greater or equal to an unanswered question", "{a} >= {b}", { a: 1 }, false],
    ["a number equals a string holding the same number", "{a} = {b}", { a: 1, b: "1" }, true],
    ["an empty string is not equal to zero", "{a} = {b}", { a: "", b: 0 }, false],
    ["an empty string equals an unanswered answer", "{a} = {b}", { a: "", b: null }, true],
    ["an empty string compares as zero in a less-than", "{a} < 5", { a: "" }, true],
    ["an empty string never compares greater", "{a} > 5", { a: "" }, false],
    ["an unanswered question is greater or equal to the empty string", "{a} >= ''", {}, true],
    ["a numeric answer is greater than a number", "{a} > 5", { a: "6" }, true],
    ["a number is greater or equal to itself", "{a} >= 5", { a: 5 }, true],
    ["a larger number is not less or equal", "{a} <= 5", { a: 6 }, false],
    ["a numeric answer in exponent form equals its number", "{a} = 1000", { a: "1e3" }, true],
    ["two numeric string literals compare as text", "'5.0' = '5'", {}, false],
    ["surrounding spaces are ignored in a string", "'  x ' = 'x'", {}, true],
    ["a trailing space is ignored in a string", "'x' = 'x '", {}, true],
    ["a string compares its code units", "'a' < 'B'", {}, false],
    ["an uppercase letter sorts before a lowercase one", "'B' < 'a'", {}, true],
    ["a string answer is compared with a string by code unit", "{a} < 'b'", { a: "B" }, true],
    ["booleans compare as numbers", "true > false", {}, true],
    ["a boolean equals its spelling in any case", "{a} = 'TRUE'", { a: true }, true],
    ["a boolean does not equal a word that is not true", "{a} = true", { a: "yes" }, false],
    ["a boolean answer does not equal a letter", "{a} = 'x'", { a: true }, false],
    ["a text zero is not false", "{a} = false", { a: "0" }, false],
    ["a string one equals one", "{a} = 1", { a: "1.0" }, true],
    ["a string one is not unequal to one", "{a} != 1", { a: "1.0" }, false],
    ["a number equals a string with a trailing space", "1 = '1 '", {}, true],
    ["a number is not equal to a string with a word after it", "{a} = 5", { a: "5 abc" }, false],
    ["a list does not equal a scalar", "{a} = 'x'", { a: ["x"] }, false],
    ["a list equals a list in any order", "[1, 2] = [2, 1]", {}, true],
    ["a list is not equal to a longer list", "{a} = [1, 2]", { a: [1, 2, 3] }, false],
    ["two records with the same fields are equal", "{a} = {b}", { a: { x: 1 }, b: { x: 1 } }, true],
    ["two records with different fields are not equal", "{a} = {b}", { a: { x: 1 }, b: { x: 2 } }, false],
    ["a record with more fields is not equal", "{a} = {b}", { a: { x: 1, y: 2 }, b: { x: 1 } }, false],
    ["a list of records compares field by field", "{a} = {b}", { a: [{ x: 1 }], b: [{ x: 1 }] }, true],
    ["lists compare their items without case", "{a} = ['a', 'b']", { a: ["A", "B"] }, true],
    // Lists sort before they compare, so an order that sorts differently under case compares unequal
    ["lists sort before they compare", "{a} = ['b', 'A']", { a: ["B", "a"] }, false],
    ["an empty list equals an empty list", "{a} = []", { a: [] }, true],
    ["an unanswered question is not equal to an empty list", "{a} = []", {}, false],
    ["an unanswered question is not equal to a list", "{a} != []", {}, true],
  ])("%s compares as %s", (_title, source, values, expected) => {
    expect.hasAssertions();

    expect(evaluate(source, values)).toStrictEqual(expected);
  });

  test.each([
    ["a list contains a string", "{a} contains 'red'", { a: ["red", "blue"] }, true],
    ["a list contains a string in any case", "{a} contains 'RED'", { a: ["red", "blue"] }, true],
    ["a list contains a number", "{a} contains 2", { a: [1, 2, 3] }, true],
    ["a list contains a number as text", "{a} contains '2'", { a: [1, 2, 3] }, true],
    ["an empty list contains nothing", "{a} contains 'x'", { a: [] }, false],
    ["an unanswered question contains nothing", "{a} contains 'x'", {}, false],
    ["a string contains a substring", "{a} contains 'x'", { a: "axb" }, true],
    ["a string contains a substring in any case", "{a} contains 'X'", { a: "axb" }, true],
    ["a string contains no empty substring", "{a} contains ''", { a: "axb" }, false],
    ["a string contains no zero", "{a} contains 0", { a: "a0b" }, false],
    ["a number contains a digit as text", "{a} contains 1", { a: 12 }, true],
    ["a number holding a digit is read as text", "{a} contains 'b'", { a: 123 }, false],
    ["a list contains a boolean", "{a} contains true", { a: [true] }, true],
    ["a list contains a boolean spelled as text", "{a} contains true", { a: ["true"] }, true],
    ["a list contains every item of a list", "{a} contains ['x', 'y']", { a: ["x", "y", "z"] }, true],
    ["a list does not contain a list with a missing item", "{a} contains ['x', 'w']", { a: ["x", "y", "z"] }, false],
    ["a list contains an empty list", "{a} contains []", { a: ["x"] }, true],
    ["an empty list does not contain an empty list", "{a} contains []", { a: [] }, false],
    ["a list does not contain a value it lacks", "{a} notcontains 'green'", { a: ["red", "blue"] }, true],
    ["a list does not contain a value it has", "{a} notcontains 'red'", { a: ["red", "blue"] }, false],
    ["an empty list contains nothing to negate", "{a} notcontains 'green'", { a: [] }, true],
    ["an unanswered question does not contain a value", "{a} notcontains 'green'", {}, true],
    ["a string does not contain a missing substring", "{a} notcontains 'x'", { a: "abc" }, true],
    ["a string does not contain a present substring", "{a} notcontains 'b'", { a: "abc" }, false],
    ["a string does not contain an empty substring", "{a} notcontains ''", { a: "abc" }, false],
    ["an empty string does not contain a value", "{a} notcontains 'x'", { a: "" }, true],
    ["a list does not contain a list with a missing item", "{a} notcontains ['x', 'y']", { a: ["red", "blue"] }, true],
    ["a record contains no text", "{a} contains 'x'", { a: { b: "x" } }, false],
    ["a record is not contained in a not-contains", "{a} notcontains 'x'", { a: { b: 1 } }, true],
    [
      "a list containing one of the values is a negated containment",
      "{a} notcontains ['red', 'x']",
      { a: ["red", "blue"] },
      true,
    ],
    ["a list is any of a list", "{a} anyof ['red', 'green']", { a: ["red", "blue"] }, true],
    ["a list is any of a list with no match", "{a} anyof ['pink', 'green']", { a: ["red", "blue"] }, false],
    ["a list is any of a list in any case", "{a} anyof ['RED']", { a: ["red"] }, true],
    ["a string is any of a list", "{a} anyof ['red']", { a: "red" }, true],
    ["an empty list is any of nothing", "{a} anyof ['red']", { a: [] }, false],
    ["any of nothing is true for an empty list", "{a} anyof []", { a: [] }, true],
    ["any of nothing is true for a list", "{a} anyof []", { a: ["red"] }, true],
    ["any of a list is false for an unanswered question", "{a} anyof ['red']", {}, false],
    ["a scalar is any of a string that contains it", "'re' anyof 'red'", {}, true],
    ["a list holding a number is any of a number", "{a} anyof 2", { a: [1, 2] }, true],
    ["a list holding a number is any of a list holding its text", "{a} anyof [1, 2]", { a: ["1"] }, true],
    ["a list is all of a list it holds", "{a} allof ['red', 'blue']", { a: ["red", "blue", "green"] }, true],
    ["a list is not all of a list with a missing item", "{a} allof ['red', 'pink']", { a: ["red", "blue"] }, false],
    ["a list is all of a list in any case", "{a} allof ['RED']", { a: ["red"] }, true],
    ["all of nothing is true for an unanswered question", "{a} allof []", {}, true],
    ["all of nothing is true for an empty list", "{a} allof []", { a: [] }, true],
    ["an empty list is not all of a list", "{a} allof ['red']", { a: [] }, false],
    ["an unanswered question is not all of a list", "{a} allof ['red']", {}, false],
    ["a list is all of a scalar it holds", "{a} allof 'red'", { a: ["red"] }, true],
    ["a string is all of the letters it holds", "{a} allof ['b', 'c']", { a: "abc" }, true],
    ["a string is not all of a letter it lacks", "{a} allof ['b', 'z']", { a: "abc" }, false],
    ["a list is all of a list in any order", "{a} allof [1, 2]", { a: [2, 1, 3] }, true],
  ])("%s holds as %s", (_title, source, values, expected) => {
    expect.hasAssertions();

    expect(evaluate(source, values)).toStrictEqual(expected);
  });

  // `and` and `or` take the value of an operand, not a boolean.
  // An empty operand reads as zero, or as the empty text or list the other operand asks for, before the operator applies
  test.each([
    ["and gives its second operand when both are truthy", "1 and 2", {}, 2],
    ["and gives zero when its first operand is zero", "0 and 1", {}, 0],
    ["and gives the second text when both are text", "'x' and 'y'", {}, "y"],
    ["and reads two unanswered questions as zero", "{a} and {b}", {}, 0],
    ["and of a true answer and a true literal is true", "{a} and true", { a: true }, true],
    ["and of two answers is false when one is false", "{a} and {b}", { a: true, b: false }, false],
    ["and gives the text of its second operand", "{a} and {b}", { a: true, b: "x" }, "x"],
    ["or reads an unanswered question as the text of its other operand", "{a} or 'x'", {}, "x"],
    ["or gives the text when its first operand is zero", "0 or 'x'", {}, "x"],
    ["or gives its second operand when its first is false", "false or 5", {}, 5],
    ["or gives its first operand when it is truthy", "1 or 2", {}, 1],
    ["an empty list is zero for and", "[] and true", {}, 0],
    ["a list is truthy for or", "[0] or 0", {}, [0]],
    ["and binds tighter than or", "{a} and {b} or {c}", { a: 1, b: 0, c: "z" }, "z"],
    ["comparisons bind tighter than and and or", "{a} = 1 and {b} = 2 or {c} = 3", { a: 1, b: 2, c: 9 }, true],
    ["an empty answer is true under not", "not {a}", { a: null }, true],
  ])("%s gives %s", (_title, source, values, expected) => {
    expect.hasAssertions();

    expect(evaluate(source, values)).toStrictEqual(expected);
  });

  // Arithmetic reads each operand as a number, and an operand that reads as none has no result.
  // A division or a remainder by zero has no result either. The one exception is `+`, which joins two texts when both are non-empty and neither reads as a number
  test.each([
    ["a sum of numbers", "1 + 2", {}, 3],
    ["a numeric text literal adds as a number", "'5' + 3", {}, 8],
    ["two text literals join", "'a' + 'b'", {}, "ab"],
    ["a text that is not a number has no sum with a number", "'a' + 1", {}, undefined],
    ["a number and a text that is not a number have no sum", "1 + 'b'", {}, undefined],
    ["a boolean has no sum with a number", "1 + true", {}, undefined],
    ["a boolean on the left has no sum with a number", "true + 1", {}, undefined],
    ["a sum is rounded to the decimals of its operands", "0.1 + 0.2", {}, 0.3],
    ["a sum keeps the decimals of its operands", "1.25 + 1", {}, 2.25],
    ["a product keeps the decimals of its operands", "1.25 * 2", {}, 2.5],
    ["a product of a decimal is rounded to its decimals", "0.1 * 3", {}, 0.3],
    ["a difference is rounded to its decimals", "1 - 0.9", {}, 0.1],
    ["a difference with text that is not a number has no result", "5 - 'x'", {}, undefined],
    ["a difference with numeric text subtracts it", "5 - '2'", {}, 3],
    ["a difference of two numeric texts subtracts them", "'8' - '2'", {}, 6],
    ["an unanswered question has no result in a difference", "{a} - 1", {}, undefined],
    ["a product with text that is not a number has no result", "{a} * 2", { a: "abc" }, undefined],
    ["a product of a list holding a number has no result", "{a} * 2", { a: [3] }, undefined],
    ["an unanswered question has no result in a sum", "{a} + 1", {}, undefined],
    ["an unanswered question has no result when joined with text", "{a} + 'x'", {}, undefined],
    ["a number and a text that is not a number have no sum", "{a} + 'x'", { a: 5 }, undefined],
    ["a numeric answer adds as a number", "{a} + 1", { a: "5" }, 6],
    ["a numeric answer with a leading zero reads as its number", "{a} + 1", { a: "0123" }, 124],
    ["an answer with trailing text has no result in a sum", "{a} + 1", { a: "5abc" }, undefined],
    ["an answer with a comma decimal has no result in a sum", "{a} + 1", { a: "1,5" }, undefined],
    ["an answer in hexadecimal has no result in a sum", "{a} + 1", { a: "0x10" }, undefined],
    ["an answer with surrounding spaces adds as a number", "{a} + 1", { a: " 5 " }, 6],
    ["an answer of only spaces has no result in a sum", "{a} + 1", { a: "  " }, undefined],
    ["an answer with an operator in it has no result in a sum", "{a} + 1", { a: "1*2" }, undefined],
    ["an answer in exponent form adds as a number", "{a} + 1", { a: "1e3" }, 1001],
    ["an answer of a decimal below one adds as a number", "{a} + 1", { a: ".5" }, 1.5],
    ["an answer of zero adds as a number", "{a} + 1", { a: "0" }, 1],
    ["an answer of two zeros reads as its number", "{a} + 1", { a: "00" }, 1],
    ["an answer of infinity has no result in a sum", "{a} + 1", { a: "Infinity" }, undefined],
    ["a list holding a number has no result in a sum", "{a} + 1", { a: [3] }, undefined],
    ["a list of text has no result in a sum", "{a} + 1", { a: ["p", "q"] }, undefined],
    ["a list of numbers has no result in a sum", "{a} + 1", { a: [1, 2] }, undefined],
    ["two lists have no result in a sum", "{a} + {b}", { a: [1, 2], b: [3] }, undefined],
    ["a list and a text have no result in a sum", "{a} + 'x'", { a: ["p", "q"] }, undefined],
    ["two text answers join", "{a} + {b}", { a: "x", b: "y" }, "xy"],
    ["two decimal answers add without float noise", "{a} + {b}", { a: 0.1, b: 0.2 }, 0.3],
    ["an empty text has no result in a sum with a number", "'' + 5", {}, undefined],
    ["an unanswered question has no result in a quotient", "{a} / 2", {}, undefined],
    ["a quotient keeps its fraction", "5 / 2", {}, 2.5],
    ["a division by zero has no result", "5 / 0", {}, undefined],
    ["a division by numeric text of zero has no result", "5 / '0'", {}, undefined],
    ["a division by an unanswered question has no result", "{a} / {b}", { a: 4 }, undefined],
    ["a division by text that is not a number has no result", "5 / 'x'", {}, undefined],
    ["a division by numeric text divides", "6 / '2'", {}, 3],
    ["a remainder keeps its sign", "5 % 3", {}, 2],
    ["a remainder of a negative number keeps its sign", "-5 % 3", {}, -2],
    ["a remainder with a negative divisor", "5 % -3", {}, 2],
    ["a remainder of a decimal keeps its fraction", "5.5 % 2", {}, 1.5],
    ["a remainder by zero has no result", "5 % 0", {}, undefined],
    ["a remainder by numeric text divides", "7 % '2'", {}, 1],
    ["a remainder of an unanswered question has no result", "{a} % 3", {}, undefined],
    ["a unary minus binds looser than a power", "-2 ^ 2", {}, -4],
    ["a power with a negative exponent", "2 ^ -2", {}, 0.25],
    ["a power", "2 ^ 3", {}, 8],
    ["a chain of powers groups to the right", "2 ^ 3 ^ 2", {}, 512],
    ["a power binds tighter than a product", "2 ^ 3 * 2", {}, 16],
    ["a power of numeric texts", "'2' ^ '3'", {}, 8],
    ["a power of text that is not a number has no result", "'a' ^ 2", {}, undefined],
    ["a power with an answer as its exponent", "2 ^ {a}", { a: "3" }, 8],
    ["a power with an unanswered exponent has no result", "2 ^ {a}", {}, undefined],
    ["multiplication binds tighter than addition", "1 + 2 * 3", {}, 7],
    ["subtraction is left associative", "1 - 2 - 3", {}, -4],
    ["a chain of subtractions and products", "10 - 2 - 3 * 2", {}, 2],
    ["a chain of divisions groups to the left", "8 / 4 / 2", {}, 1],
    ["a quotient is not rounded", "1 / 3", {}, 1 / 3],
    ["a product of decimals is rounded to its decimals", "100 * 1.1", {}, 110],
    ["a product of a decimal that rounds up", "1.005 * 1000", {}, 1005],
    ["a sum of decimals is rounded", "0.1 + 0.7", {}, 0.8],
    ["a sum of an answer with a decimal literal", "{a} + 1.5", { a: "2.25" }, 3.75],
    ["a product of an answer with a decimal literal", "{a} * 1.5", { a: "2.25" }, 3.375],
    ["a comparison of a sum is a boolean", "{a} + 1 > 2", { a: 2 }, true],
  ])("%s gives %s", (_title, source, values, expected) => {
    expect.hasAssertions();

    expect(evaluate(source, values)).toStrictEqual(expected);
  });

  // The emptiness of an answer is decided by its value.
  // An empty text, an empty list, an unanswered question and a null are empty, and zero, false and a space are not
  test.each([
    ["zero is not empty", "{a} empty", { a: 0 }, false],
    ["false is not empty", "{a} empty", { a: false }, false],
    ["an empty text is empty", "{a} empty", { a: "" }, true],
    ["a space is not empty", "{a} empty", { a: "  " }, false],
    ["an empty list is empty", "{a} empty", { a: [] }, true],
    ["a list holding an empty text is not empty", "{a} empty", { a: [""] }, false],
    ["a list holding zero is not empty", "{a} empty", { a: [0] }, false],
    ["an answer stored as nothing is empty", "{a} empty", { a: null }, true],
    ["an unanswered question is empty", "{a} empty", {}, true],
    ["a word is not empty", "{a} empty", { a: "x" }, false],
    ["a zero text is not empty", "{a} empty", { a: "0" }, false],
    ["a false text is not empty", "{a} empty", { a: "false" }, false],
    ["zero is not notempty", "{a} notempty", { a: 0 }, true],
    ["an empty list is not notempty", "{a} notempty", { a: [] }, false],
    ["a list holding a number is notempty", "{a} notempty", { a: [1] }, true],
    ["an unanswered question is not notempty", "{a} notempty", {}, false],
  ])("%s gives %s", (_title, source, values, expected) => {
    expect.hasAssertions();

    expect(evaluate(source, values)).toStrictEqual(expected);
  });

  // An answer reads as the value it is stored as: a text stays text, even one spelling a boolean or wrapped in quotes.
  // An operation reads it as a number only where it needs one
  test.each([
    ["a numeric answer reads as a number", "{a} = 5", { a: "5" }, true],
    ["a text answer spelling a boolean stays text", "{a} + 'x'", { a: "TRUE" }, "TRUEx"],
    ["a quoted answer keeps its quotes", "{a} + 'x'", { a: "'hi'" }, "'hi'x"],
    ["a double-quoted answer keeps its quotes", "{a} + 'x'", { a: '"hi"' }, '"hi"x'],
    ["a dotted name with no key reads as empty", "{a.b} empty", { a: 5 }, true],
    ["a dotted name reads a nested answer", "{m.row1.col1}", { m: { row1: { col1: 7 } } }, 7],
    ["a whole dotted key is read before a path", "{m.row1.col1}", { m: { row1: { col1: 7 } }, "m.row1.col1": 9 }, 9],
    ["a dotted key holds dots at any depth", "{a.b.c}", { "a.b": { c: 4 } }, 4],
    ["a dotted key inside a nested answer", "{a.b.c}", { a: { "b.c": 4 } }, 4],
    ["an index reads an item of a list under a key", "{panel[0].q1}", { panel: [{ q1: "x" }] }, "x"],
    ["an index reads an item of a list under a nested key", "{a.b[0]}", { a: { b: [7] } }, 7],
    ["an index into a list of lists reads the nested index", "{x[0].y[1]}", { x: [{ y: [1, 9] }] }, 9],
    ["a digit key reads an item of a list", "{m.0}", { m: [5] }, 5],
    ["an index past the end of a list is empty", "{list[5]} empty", { list: [1, 2] }, true],
    ["an index into a record is empty", "{m[0]} empty", { m: { 0: 4 } }, true],
    ["a second index on a part is empty", "{m[0][1]} empty", { m: [[1, 2]] }, true],
    [
      "a nested answer that is a record is empty when its fields are",
      "{m.row1} empty",
      { m: { row1: { col1: "" } } },
      true,
    ],
    ["length reads the items of a list", "{list.length}", { list: [1, 2, 3] }, 3],
    ["length reads the characters of a text", "{list.length}", { list: "abc" }, 3],
    ["length of an unanswered list is zero", "{a.length}", {}, 0],
    ["length of a number is zero", "{a.length}", { a: 12 }, 0],
    ["length reads a key named length before a list's length", "{m.length}", { m: { length: 5 } }, 5],
    ["a name with no key and no dot is empty", "{length} empty", {}, true],
    ["a list reads the values of its items", "[1, {b}, 'x']", { b: "y" }, [1, "y", "x"]],
  ])("%s gives %s", (_title, source, values, expected) => {
    expect.hasAssertions();

    expect(evaluate(source, values)).toStrictEqual(expected);
  });

  // This package's own rule, not SurveyJS's: a name reads its exact key, where SurveyJS also reads the other case
  test("a name reads its exact key, never a key in another case", () => {
    expect.hasAssertions();

    expect(evaluate("{AGE} empty", { age: 5 })).toBe(true);
  });

  // This package's own rule: SurveyJS has no `not` keyword and refuses a minus before a name.
  // Both forms are read by their meaning here, so they have no SurveyJS value to match
  test("not negates a falsy answer", () => {
    expect.hasAssertions();

    expect(evaluate("not {a}", { a: 0 })).toBe(true);
  });

  test("a unary minus negates an answer", () => {
    expect.hasAssertions();

    expect(evaluate("-{a}", { a: 5 })).toBe(-5);
  });

  test("a reference to a dynamic panel's answer reads the panel scope", () => {
    expect.hasAssertions();

    expect(
      parseSurveyExpression("{panel.x} + 1").match(
        (node) => evaluateSurveyExpression(node, { now, scopes: { panel: { x: 3 } }, values: {} }),
        (error) => error,
      ),
    ).toBe(4);
  });

  test("an unknown function is empty", () => {
    expect.hasAssertions();

    expect(evaluate("nosuchfunction({age})", { age: 1 })).toBeUndefined();
  });
});
