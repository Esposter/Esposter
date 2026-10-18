import type { MathExpressionFunction } from "#src/models/MathExpressionFunction";
import type { MathExpressionNode } from "#src/models/MathExpressionNode";
import type { MathExpressionParserState } from "#src/models/MathExpressionParserState";
import type { Result } from "neverthrow";

import { MathExpressionError } from "#src/models/MathExpressionError";
import { MathExpressionListForm } from "#src/models/MathExpressionListForm";
import { MathExpressionLogicalOperator } from "#src/models/MathExpressionLogicalOperator";
import { MathExpressionNodeType } from "#src/models/MathExpressionNodeType";
import { MathExpressionTokenType } from "#src/models/MathExpressionTokenType";
import { computeNumberLiteral } from "#src/services/computeNumberLiteral";
import { MAX_MATH_EXPRESSION_DEPTH } from "#src/services/constants";
import { failMathExpression } from "#src/services/failMathExpression";
import { getMathExpressionToken } from "#src/services/getMathExpressionToken";
import { MathExpressionFunctionMap } from "#src/services/MathExpressionFunctionMap";
import { err, ok } from "neverthrow";

// The operators of each level, from the loosest binding to the tightest, as the function each one computes. Each
// Level's parse reads its operands from the level below, so the precedence is the order of the functions
const RELATIONAL_OPERATORS: Readonly<Record<string, string>> = {
  "!=": "unequal",
  "<": "smaller",
  "<=": "smallerEq",
  "==": "equal",
  ">": "larger",
  ">=": "largerEq",
};
const SHIFT_OPERATORS: Readonly<Record<string, string>> = {
  "<<": "leftShift",
  ">>": "rightArithShift",
  ">>>": "rightLogShift",
};
const ADD_OPERATORS: Readonly<Record<string, string>> = { "+": "add", "-": "subtract" };
const MULTIPLY_OPERATORS: Readonly<Record<string, string>> = {
  "%": "mod",
  "*": "multiply",
  ".*": "dotMultiply",
  "./": "dotDivide",
  "/": "divide",
  mod: "mod",
};
const UNARY_OPERATORS: Readonly<Record<string, string>> = {
  "+": "unaryPlus",
  "-": "unaryMinus",
  not: "not",
  "~": "bitNot",
};
const POWER_OPERATORS: Readonly<Record<string, string>> = { ".^": "dotPow", "^": "pow" };
const PLACEHOLDER: MathExpressionNode = { type: MathExpressionNodeType.Number, value: Number.NaN };

const checkHasOperator = (operators: Readonly<Record<string, string>>, token: string): boolean =>
  Object.hasOwn(operators, token);

const checkCanNest = (state: MathExpressionParserState): boolean => {
  if (state.depth < MAX_MATH_EXPRESSION_DEPTH) return true;

  failMathExpression(state, `Formula nests deeper than ${MAX_MATH_EXPRESSION_DEPTH} levels`);
  return false;
};

const restore = (state: MathExpressionParserState, snapshot: MathExpressionParserState): void => {
  Object.assign(state, snapshot);
};

const checkIsSignedNumber = (node: MathExpressionNode): boolean => {
  if (node.type === MathExpressionNodeType.Number) return true;
  return (
    node.type === MathExpressionNodeType.Unary &&
    (node.name === "unaryMinus" || node.name === "unaryPlus") &&
    node.operand.type === MathExpressionNodeType.Number
  );
};

// A constant of the implicit product, which a name or a parenthesis after it does not multiply again: `2 3` is an error
const checkIsConstantOperand = (node: MathExpressionNode): boolean => {
  if (node.type === MathExpressionNodeType.Number) return true;
  return (
    node.type === MathExpressionNodeType.Unary &&
    (node.name === "unaryMinus" || node.name === "unaryPlus" || node.name === "bitNot") &&
    node.operand.type === MathExpressionNodeType.Number
  );
};

// The operators that a number cannot follow in an implicit product, where a factorial is still an operand
const checkIsOperatorOperand = (node: MathExpressionNode): boolean => {
  if (node.type === MathExpressionNodeType.Unary) return node.name !== "factorial";
  return (
    node.type === MathExpressionNodeType.Binary ||
    node.type === MathExpressionNodeType.Comparison ||
    node.type === MathExpressionNodeType.Logical
  );
};

const parseSequence = (state: MathExpressionParserState, closing: string): MathExpressionNode[] => {
  const nodes: MathExpressionNode[] = [];
  if (state.token === closing) return nodes;

  while (state.error === null) {
    nodes.push(parseAssignment(state));
    if (state.token !== ",") break;
    getMathExpressionToken(state);
  }
  if (state.error === null && state.token !== closing)
    failMathExpression(state, closing === ")" ? "Parenthesis ) expected" : "Parenthesis ] expected");
  return nodes;
};

const getArityMessage = (name: string, definition: MathExpressionFunction): string => {
  if (definition.maxArity === Number.POSITIVE_INFINITY)
    return `"${name}" takes at least ${definition.minArity} arguments`;
  if (definition.minArity === definition.maxArity) return `"${name}" takes ${definition.minArity} arguments`;
  return `"${name}" takes ${definition.minArity} or ${definition.maxArity} arguments`;
};

const parseCall = (state: MathExpressionParserState, name: string): MathExpressionNode => {
  const definition = Object.hasOwn(MathExpressionFunctionMap, name) ? MathExpressionFunctionMap[name] : undefined;
  if (definition === undefined) {
    if (state.error === null) state.error = new MathExpressionError(`Unknown function "${name}"`);
    return PLACEHOLDER;
  }

  getMathExpressionToken(state);
  const isList = state.token === "[";
  let argumentNodes: MathExpressionNode[];
  if (isList) {
    getMathExpressionToken(state);
    const listNodes = parseSequence(state, "]");
    if (state.error === null && definition.listForm === MathExpressionListForm.None)
      state.error = new MathExpressionError(`"${name}" does not take a list argument`);
    argumentNodes = listNodes;
    if (state.error === null) getMathExpressionToken(state);
    if (state.error === null && state.token !== ")") failMathExpression(state, "Parenthesis ) expected");
  } else argumentNodes = parseSequence(state, ")");

  if (state.error !== null) return PLACEHOLDER;

  getMathExpressionToken(state);
  if (definition.listForm === MathExpressionListForm.Only && !isList) {
    state.error = new MathExpressionError(`"${name}" takes a list argument`);
    return PLACEHOLDER;
  }
  // A list spreads into the arguments of a spread function, whose computation decides what a list of any length means
  const isSpread = isList && definition.listForm !== MathExpressionListForm.Argument;
  if (!isSpread && (argumentNodes.length < definition.minArity || argumentNodes.length > definition.maxArity)) {
    if (state.error === null) state.error = new MathExpressionError(getArityMessage(name, definition));
    return PLACEHOLDER;
  }
  return { arguments: argumentNodes, name, type: MathExpressionNodeType.Call };
};

const parseSymbol = (state: MathExpressionParserState): MathExpressionNode => {
  if (state.tokenType === MathExpressionTokenType.Number) {
    const value = computeNumberLiteral(state.token);
    if (value === null) {
      failMathExpression(state, `String "${state.token.split("i")[0]}" is out of range`);
      getMathExpressionToken(state);
      return PLACEHOLDER;
    }

    getMathExpressionToken(state);
    return { type: MathExpressionNodeType.Number, value };
  }

  const isName =
    state.tokenType === MathExpressionTokenType.Symbol ||
    (state.tokenType === MathExpressionTokenType.Delimiter && Object.hasOwn(MathExpressionFunctionMap, state.token));
  if (isName) {
    const name = state.token;
    const isSymbol = state.tokenType === MathExpressionTokenType.Symbol;
    getMathExpressionToken(state);
    if (state.token === "(") return parseCall(state, name);
    if (isSymbol) return { name, type: MathExpressionNodeType.Name };
  }

  if (state.token === "(") {
    getMathExpressionToken(state);
    const operand = parseAssignment(state);
    if (state.error === null && state.token !== ")") failMathExpression(state, "Parenthesis ) expected");
    if (state.error !== null) return PLACEHOLDER;

    getMathExpressionToken(state);
    return { operand, type: MathExpressionNodeType.Group };
  }

  failMathExpression(state, state.token === "" ? "Unexpected end of expression" : "Value expected");
  return PLACEHOLDER;
};

const parseLeftHand = (state: MathExpressionParserState): MathExpressionNode => {
  let node = parseSymbol(state);
  while (state.error === null && (state.token === "!" || state.token === "'")) {
    const name = state.token === "!" ? "factorial" : "ctranspose";
    getMathExpressionToken(state);
    node = { name, operand: node, type: MathExpressionNodeType.Unary };
  }
  return node;
};

const parseNullish = (state: MathExpressionParserState): MathExpressionNode => {
  let node = parseLeftHand(state);
  while (state.error === null && state.token === "??") {
    getMathExpressionToken(state);
    const right = parseLeftHand(state);
    node = { left: node, operator: MathExpressionLogicalOperator.Nullish, right, type: MathExpressionNodeType.Logical };
  }
  return node;
};

const parsePower = (state: MathExpressionParserState): MathExpressionNode => {
  const base = parseNullish(state);
  if (state.error !== null || !checkHasOperator(POWER_OPERATORS, state.token)) return base;

  const name = POWER_OPERATORS[state.token] ?? "pow";
  getMathExpressionToken(state);
  const exponent = parseUnary(state);
  return { left: base, name, right: exponent, type: MathExpressionNodeType.Binary };
};

const parseUnary = (state: MathExpressionParserState): MathExpressionNode => {
  if (!checkHasOperator(UNARY_OPERATORS, state.token)) return parsePower(state);
  if (!checkCanNest(state)) return PLACEHOLDER;

  const name = UNARY_OPERATORS[state.token] ?? "unaryPlus";
  getMathExpressionToken(state);
  state.depth++;
  const operand = parseUnary(state);
  state.depth--;
  return { name, operand, type: MathExpressionNodeType.Unary };
};

// A `%` after an operand is a percentage unless an operand follows it, when it is the modulo operator
const parsePercentage = (state: MathExpressionParserState): MathExpressionNode => {
  const node = parseUnary(state);
  if (state.error !== null || state.token !== "%") return node;

  const snapshot = { ...state };
  getMathExpressionToken(state);
  // A sign after the sign is the start of the next term, so the percent sign is always a percentage before one
  const isSignNext = state.token === "+" || state.token === "-";
  if (!isSignNext) parseUnary(state);
  const isModulo = !isSignNext && state.error === null;
  restore(state, snapshot);
  if (isModulo) return node;

  getMathExpressionToken(state);
  return { operand: node, type: MathExpressionNodeType.Percentage };
};

// A division of one signed number by another, followed by a name or a parenthesis, is taken first, so `1/2 col0` is
// `(1/2) * col0`, as mathjs reads it
const parseDivisionBeforeProduct = (state: MathExpressionParserState): MathExpressionNode => {
  const dividend = parsePercentage(state);
  if (state.error !== null || state.token !== "/" || !checkIsSignedNumber(dividend)) return dividend;

  const snapshot = { ...state };
  getMathExpressionToken(state);
  const divisor = parsePercentage(state);
  // Mathjs takes only an unsigned divisor into the exception: a signed one binds to the name after it, so 1/-2 col0 is 1/-6
  const isProductFactor =
    state.error === null &&
    divisor.type === MathExpressionNodeType.Number &&
    (state.tokenType === MathExpressionTokenType.Symbol || state.token === "(");
  if (isProductFactor) return { left: dividend, name: "divide", right: divisor, type: MathExpressionNodeType.Binary };

  restore(state, snapshot);
  return dividend;
};

const parseImplicitProduct = (state: MathExpressionParserState): MathExpressionNode => {
  let node = parseDivisionBeforeProduct(state);
  let last = node;
  while (state.error === null) {
    const isFactorStart =
      state.tokenType === MathExpressionTokenType.Symbol ||
      state.token === "(" ||
      (state.tokenType === MathExpressionTokenType.Number &&
        !checkIsConstantOperand(last) &&
        !checkIsOperatorOperand(last));
    if (!isFactorStart) break;

    last = parseDivisionBeforeProduct(state);
    node = { left: node, name: "multiply", right: last, type: MathExpressionNodeType.Binary };
  }
  return node;
};

const parseMultiplyDivide = (state: MathExpressionParserState): MathExpressionNode => {
  let node = parseImplicitProduct(state);
  while (state.error === null && checkHasOperator(MULTIPLY_OPERATORS, state.token)) {
    const name = MULTIPLY_OPERATORS[state.token] ?? "multiply";
    getMathExpressionToken(state);
    const right = parseImplicitProduct(state);
    node = { left: node, name, right, type: MathExpressionNodeType.Binary };
  }
  return node;
};

const parseAddSubtract = (state: MathExpressionParserState): MathExpressionNode => {
  let node = parseMultiplyDivide(state);
  while (state.error === null && checkHasOperator(ADD_OPERATORS, state.token)) {
    const name = ADD_OPERATORS[state.token] ?? "add";
    getMathExpressionToken(state);
    const right = parseMultiplyDivide(state);
    node = { left: node, name, right, type: MathExpressionNodeType.Binary };
  }
  return node;
};

const parseShift = (state: MathExpressionParserState): MathExpressionNode => {
  let node = parseAddSubtract(state);
  while (state.error === null && checkHasOperator(SHIFT_OPERATORS, state.token)) {
    const name = SHIFT_OPERATORS[state.token] ?? "leftShift";
    getMathExpressionToken(state);
    const right = parseAddSubtract(state);
    node = { left: node, name, right, type: MathExpressionNodeType.Binary };
  }
  return node;
};

// Comparisons chain: `a < b < c` holds when each adjacent pair does, so the operands are kept in order
const parseRelational = (state: MathExpressionParserState): MathExpressionNode => {
  const first = parseShift(state);
  const names: string[] = [];
  const operands: MathExpressionNode[] = [first];
  while (state.error === null && checkHasOperator(RELATIONAL_OPERATORS, state.token)) {
    names.push(RELATIONAL_OPERATORS[state.token] ?? "equal");
    getMathExpressionToken(state);
    operands.push(parseShift(state));
  }
  if (names.length === 0) return first;
  return { names, operands, type: MathExpressionNodeType.Comparison };
};

const parseBitwiseAnd = (state: MathExpressionParserState): MathExpressionNode => {
  let node = parseRelational(state);
  while (state.error === null && state.token === "&") {
    getMathExpressionToken(state);
    const right = parseRelational(state);
    node = { left: node, name: "bitAnd", right, type: MathExpressionNodeType.Binary };
  }
  return node;
};

const parseBitwiseXor = (state: MathExpressionParserState): MathExpressionNode => {
  let node = parseBitwiseAnd(state);
  while (state.error === null && state.token === "^|") {
    getMathExpressionToken(state);
    const right = parseBitwiseAnd(state);
    node = { left: node, name: "bitXor", right, type: MathExpressionNodeType.Binary };
  }
  return node;
};

const parseBitwiseOr = (state: MathExpressionParserState): MathExpressionNode => {
  let node = parseBitwiseXor(state);
  while (state.error === null && state.token === "|") {
    getMathExpressionToken(state);
    const right = parseBitwiseXor(state);
    node = { left: node, name: "bitOr", right, type: MathExpressionNodeType.Binary };
  }
  return node;
};

const parseLogicalAnd = (state: MathExpressionParserState): MathExpressionNode => {
  let node = parseBitwiseOr(state);
  while (state.error === null && state.token === "and") {
    getMathExpressionToken(state);
    const right = parseBitwiseOr(state);
    node = { left: node, operator: MathExpressionLogicalOperator.And, right, type: MathExpressionNodeType.Logical };
  }
  return node;
};

const parseLogicalXor = (state: MathExpressionParserState): MathExpressionNode => {
  let node = parseLogicalAnd(state);
  while (state.error === null && state.token === "xor") {
    getMathExpressionToken(state);
    const right = parseLogicalAnd(state);
    node = { left: node, name: "xor", right, type: MathExpressionNodeType.Binary };
  }
  return node;
};

const parseLogicalOr = (state: MathExpressionParserState): MathExpressionNode => {
  let node = parseLogicalXor(state);
  while (state.error === null && state.token === "or") {
    getMathExpressionToken(state);
    const right = parseLogicalXor(state);
    node = { left: node, operator: MathExpressionLogicalOperator.Or, right, type: MathExpressionNodeType.Logical };
  }
  return node;
};

// The true branch is an assignment, so a conditional may nest inside it; the false branch is right associative
const parseConditional = (state: MathExpressionParserState): MathExpressionNode => {
  const condition = parseLogicalOr(state);
  if (state.error !== null || state.token !== "?") return condition;

  getMathExpressionToken(state);
  if (state.token === ":") {
    failMathExpression(state, "The true-expression of a conditional operator may not be empty");
    return PLACEHOLDER;
  }
  const whenTrue = parseAssignment(state);
  if (state.error === null && state.token !== ":")
    failMathExpression(state, "False part of conditional expression expected");

  if (state.error !== null) return PLACEHOLDER;

  getMathExpressionToken(state);
  const whenFalse = parseConditional(state);
  return { condition, type: MathExpressionNodeType.Conditional, whenFalse, whenTrue };
};

// An assignment binds a plain name, and the value on its right is an assignment in turn
const parseAssignment = (state: MathExpressionParserState): MathExpressionNode => {
  if (!checkCanNest(state)) return PLACEHOLDER;

  state.depth++;
  const left = parseConditional(state);
  let node = left;
  if (state.error === null && state.token === "=")
    if (left.type === MathExpressionNodeType.Name) {
      getMathExpressionToken(state);
      const value = parseAssignment(state);
      node = { name: left.name, type: MathExpressionNodeType.Assignment, value };
    } else failMathExpression(state, "Invalid left hand side of assignment operator =");

  state.depth--;
  return node;
};

// Parses a whole formula into its tree, or returns the first error it meets, positioned as mathjs positions it
export const parseMathExpression = (formula: string): Result<MathExpressionNode, MathExpressionError> => {
  const state: MathExpressionParserState = {
    depth: 0,
    error: null,
    index: 0,
    nestingLevel: 0,
    source: formula,
    token: "",
    tokenType: MathExpressionTokenType.Null,
  };
  getMathExpressionToken(state);
  const node = parseAssignment(state);
  if (state.error === null && state.token !== "")
    failMathExpression(
      state,
      state.tokenType === MathExpressionTokenType.Delimiter
        ? `Unexpected operator ${state.token}`
        : `Unexpected part "${state.token}"`,
    );

  return state.error === null ? ok(node) : err(state.error);
};
