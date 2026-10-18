import type { MathExpressionNode } from "#src/models/mathExpression/MathExpressionNode";

import { MathExpressionLogicalOperator } from "#src/models/mathExpression/MathExpressionLogicalOperator";
import { MathExpressionNodeType } from "#src/models/mathExpression/MathExpressionNodeType";
import { checkIsTruthy } from "#src/services/mathExpression/checkIsTruthy";
import { getMathExpressionChildren } from "#src/services/mathExpression/getMathExpressionChildren";
import { getMathExpressionFunction } from "#src/services/mathExpression/getMathExpressionFunction";
import { MathExpressionConstantMap } from "#src/services/mathExpression/MathExpressionConstantMap";
import { toNumber } from "#src/services/mathExpression/toNumber";
import { exhaustiveGuard } from "#src/util/validation/exhaustiveGuard";

interface CompileContext {
  assignedSlots: ReadonlyMap<string, number>;
  variableIndices: ReadonlyMap<string, number>;
}
interface Compiled {
  evaluate: Evaluator;
  isConstant: boolean;
}
type Compute = (...values: number[]) => Result;
type Evaluator = (values: readonly number[], locals: Result[]) => Result;
// An evaluator yields null where mathjs would throw, which is an error that the whole formula takes, and NaN where mathjs
// Yields NaN as a value, which a comparison or a condition reads as mathjs does. The public function makes an error NaN
type Result = null | number;

const NO_VALUES: readonly number[] = [];
const NO_LOCALS: Result[] = [];

const getCompute = (name: string): Compute => getMathExpressionFunction(name)?.compute ?? (() => null);

// A percentage expression is a percentage, or a sum or difference of percentage expressions
const checkIsPercentageExpression = (node: MathExpressionNode): boolean => {
  if (node.type === MathExpressionNodeType.Percentage) return true;
  if (node.type !== MathExpressionNodeType.Binary) return false;
  if (node.name !== "add" && node.name !== "subtract") return false;
  return checkIsPercentageExpression(node.left) && checkIsPercentageExpression(node.right);
};

const collectAssignedNames = (node: MathExpressionNode, names: Set<string>): void => {
  if (node.type === MathExpressionNodeType.Assignment) names.add(node.name);
  for (const child of getMathExpressionChildren(node)) collectAssignedNames(child, names);
};

const getConstantValue = (name: string): number | undefined =>
  Object.hasOwn(MathExpressionConstantMap, name) ? MathExpressionConstantMap[name] : undefined;

const compileName = (name: string, context: CompileContext): Compiled => {
  // An assigned name reads the slot, which starts at its outer value, so it reads that until its assignment runs
  const slot = context.assignedSlots.get(name);
  if (slot !== undefined) return { evaluate: (_values, locals) => locals[slot] ?? null, isConstant: false };

  const index = context.variableIndices.get(name);
  if (index !== undefined) return { evaluate: (values) => values[index] ?? Number.NaN, isConstant: false };

  // A name that is neither a variable, an assignment nor a constant is an error, not a value
  const constant = getConstantValue(name);
  return { evaluate: () => constant ?? null, isConstant: true };
};

const compileComparison = (names: string[], operands: MathExpressionNode[], context: CompileContext): Compiled => {
  const compiledOperands = operands.map((operand) => compileNode(operand, context));
  const computes = names.map((name) => getCompute(name));
  // A chain holds only while each pair does, and a pair past the first false one is never read
  const evaluate: Evaluator = (values, locals) => {
    let left = compiledOperands[0]?.evaluate(values, locals) ?? null;
    let result: Result = 1;
    for (const [index, compute] of computes.entries()) {
      const right = compiledOperands[index + 1]?.evaluate(values, locals) ?? null;
      if (left === null || right === null) return null;
      result = compute(left, right);
      if (result !== 1) return result;
      left = right;
    }
    return result;
  };
  return { evaluate, isConstant: compiledOperands.every((operand) => operand.isConstant) };
};

// The left operands that decide a bitwise and or or: zero for and, and minus one for or
const BITWISE_ABSORPTIONS: Readonly<Record<string, { absorbs: number; result: number }>> = {
  bitAnd: { absorbs: 0, result: 0 },
  bitOr: { absorbs: -1, result: -1 },
};

const compileBinary = (
  name: string,
  left: MathExpressionNode,
  right: MathExpressionNode,
  context: CompileContext,
): Compiled => {
  const compiledLeft = compileNode(left, context);
  // X + y% is x + x * y / 100, unless x is a percentage expression, where the right side adds as a plain value
  const isAdditive = name === "add" || name === "subtract";
  if (isAdditive && right.type === MathExpressionNodeType.Percentage && !checkIsPercentageExpression(left)) {
    const compiledPercent = compileNode(right.operand, context);
    const sign = name === "add" ? 1 : -1;
    const evaluate: Evaluator = (values, locals) => {
      const base = compiledLeft.evaluate(values, locals);
      const percent = compiledPercent.evaluate(values, locals);
      if (base === null || percent === null) return null;
      return base + sign * base * (percent / 100);
    };
    return { evaluate, isConstant: compiledLeft.isConstant && compiledPercent.isConstant };
  }

  const compiledRight = compileNode(right, context);
  const compute = getCompute(name);
  const absorption = BITWISE_ABSORPTIONS[name];
  // A left operand that decides a bitwise operation answers it, and the right operand is never read, as in mathjs
  const evaluate: Evaluator = (values, locals) => {
    const leftValue = compiledLeft.evaluate(values, locals);
    if (leftValue === null) return null;
    if (absorption?.absorbs === leftValue) return absorption.result;

    const rightValue = compiledRight.evaluate(values, locals);
    if (rightValue === null) return null;
    return compute(leftValue, rightValue);
  };
  return { evaluate, isConstant: compiledLeft.isConstant && compiledRight.isConstant };
};

const compileLogical = (
  operator: MathExpressionLogicalOperator,
  left: MathExpressionNode,
  right: MathExpressionNode,
  context: CompileContext,
): Compiled => {
  const compiledLeft = compileNode(left, context);
  const compiledRight = compileNode(right, context);
  const isConstant = compiledLeft.isConstant && compiledRight.isConstant;
  switch (operator) {
    case MathExpressionLogicalOperator.And:
      return {
        evaluate: (values, locals) => {
          const leftValue = compiledLeft.evaluate(values, locals);
          if (leftValue === null) return null;
          if (!checkIsTruthy(leftValue)) return 0;
          const rightValue = compiledRight.evaluate(values, locals);
          return rightValue === null ? null : toNumber(checkIsTruthy(rightValue));
        },
        isConstant,
      };
    case MathExpressionLogicalOperator.Nullish:
      return {
        evaluate: (values, locals) => compiledLeft.evaluate(values, locals),
        isConstant: compiledLeft.isConstant,
      };
    case MathExpressionLogicalOperator.Or:
      return {
        evaluate: (values, locals) => {
          const leftValue = compiledLeft.evaluate(values, locals);
          if (leftValue === null) return null;
          if (checkIsTruthy(leftValue)) return 1;
          const rightValue = compiledRight.evaluate(values, locals);
          return rightValue === null ? null : toNumber(checkIsTruthy(rightValue));
        },
        isConstant,
      };
    default:
      return exhaustiveGuard(operator);
  }
};

const compileConditional = (
  condition: MathExpressionNode,
  whenTrue: MathExpressionNode,
  whenFalse: MathExpressionNode,
  context: CompileContext,
): Compiled => {
  const compiledCondition = compileNode(condition, context);
  const compiledWhenTrue = compileNode(whenTrue, context);
  const compiledWhenFalse = compileNode(whenFalse, context);
  // Only the chosen branch is evaluated, and a condition that is NaN is false, as in mathjs
  const evaluate: Evaluator = (values, locals) => {
    const test = compiledCondition.evaluate(values, locals);
    if (test === null) return null;
    return checkIsTruthy(test) ? compiledWhenTrue.evaluate(values, locals) : compiledWhenFalse.evaluate(values, locals);
  };
  return {
    evaluate,
    isConstant: compiledCondition.isConstant && compiledWhenTrue.isConstant && compiledWhenFalse.isConstant,
  };
};

// A call of one or two arguments applies its function directly, with no array per row, and a longer call gathers its values
const compileCall = (name: string, argumentNodes: MathExpressionNode[], context: CompileContext): Compiled => {
  const compute = getCompute(name);
  const compiledArguments = argumentNodes.map((argument) => compileNode(argument, context));
  const isConstant = compiledArguments.every((argument) => argument.isConstant);
  const [first, second] = compiledArguments;
  if (compiledArguments.length === 1 && first !== undefined)
    return {
      evaluate: (values, locals) => {
        const firstValue = first.evaluate(values, locals);
        return firstValue === null ? null : compute(firstValue);
      },
      isConstant,
    };

  if (compiledArguments.length === 2 && first !== undefined && second !== undefined)
    return {
      evaluate: (values, locals) => {
        const firstValue = first.evaluate(values, locals);
        if (firstValue === null) return null;
        const secondValue = second.evaluate(values, locals);
        return secondValue === null ? null : compute(firstValue, secondValue);
      },
      isConstant,
    };

  return {
    evaluate: (values, locals) => {
      const argumentValues: number[] = [];
      for (const argument of compiledArguments) {
        const argumentValue = argument.evaluate(values, locals);
        if (argumentValue === null) return null;
        argumentValues.push(argumentValue);
      }
      return compute(...argumentValues);
    },
    isConstant,
  };
};

const compileUnfolded = (node: MathExpressionNode, context: CompileContext): Compiled => {
  switch (node.type) {
    case MathExpressionNodeType.Assignment: {
      const slot = context.assignedSlots.get(node.name) ?? 0;
      const compiledValue = compileNode(node.value, context);
      return {
        evaluate: (values, locals) => {
          const value = compiledValue.evaluate(values, locals);
          locals[slot] = value;
          return value;
        },
        isConstant: false,
      };
    }
    case MathExpressionNodeType.Binary:
      return compileBinary(node.name, node.left, node.right, context);
    case MathExpressionNodeType.Call:
      return compileCall(node.name, node.arguments, context);
    case MathExpressionNodeType.Comparison:
      return compileComparison(node.names, node.operands, context);
    case MathExpressionNodeType.Conditional:
      return compileConditional(node.condition, node.whenTrue, node.whenFalse, context);
    case MathExpressionNodeType.Group:
      return compileNode(node.operand, context);
    case MathExpressionNodeType.Logical:
      return compileLogical(node.operator, node.left, node.right, context);
    case MathExpressionNodeType.Name:
      return compileName(node.name, context);
    case MathExpressionNodeType.Number: {
      const { value } = node;
      return { evaluate: () => value, isConstant: true };
    }
    case MathExpressionNodeType.Percentage: {
      const compiledOperand = compileNode(node.operand, context);
      return {
        evaluate: (values, locals) => {
          const operandValue = compiledOperand.evaluate(values, locals);
          return operandValue === null ? null : operandValue / 100;
        },
        isConstant: compiledOperand.isConstant,
      };
    }
    case MathExpressionNodeType.Unary: {
      const compute = getCompute(node.name);
      const compiledOperand = compileNode(node.operand, context);
      return {
        evaluate: (values, locals) => {
          const operandValue = compiledOperand.evaluate(values, locals);
          return operandValue === null ? null : compute(operandValue);
        },
        isConstant: compiledOperand.isConstant,
      };
    }
    default:
      return exhaustiveGuard(node);
  }
};

// A subtree that reads no variable and no assignment is computed once, here, and an error it folds to is kept as an error
const compileNode = (node: MathExpressionNode, context: CompileContext): Compiled => {
  const compiled = compileUnfolded(node, context);
  if (!compiled.isConstant) return compiled;

  const value = compiled.evaluate(NO_VALUES, NO_LOCALS);
  return { evaluate: () => value, isConstant: true };
};

// The value an assigned name holds before its assignment runs: the variable of that name, else the constant, else nothing
interface OuterBinding {
  constant?: number;
  variableIndex?: number;
}

const readOuterValue = (outer: OuterBinding, values: readonly number[]): Result => {
  if (outer.variableIndex !== undefined) return values[outer.variableIndex] ?? Number.NaN;
  return outer.constant ?? null;
};

// Compiles a parsed formula into a function of the values of the variables named by `variableNames`, in that order. A name
// The formula reads that is neither a variable, an assignment nor a constant is an error, which the function yields as NaN.
// Each call starts every assigned name at its outer value, as mathjs reads it until the assignment runs
export const compileMathExpression = (
  node: MathExpressionNode,
  variableNames: readonly string[],
): ((values: readonly number[]) => number) => {
  const assignedNames = new Set<string>();
  collectAssignedNames(node, assignedNames);
  const assignedSlots = new Map(Array.from(assignedNames, (name, slot): [string, number] => [name, slot]));
  const variableIndices = new Map(variableNames.map((name, index): [string, number] => [name, index]));
  const compiled = compileNode(node, { assignedSlots, variableIndices });
  const outerBindings: OuterBinding[] = Array.from(assignedNames, (name) => ({
    constant: getConstantValue(name),
    variableIndex: variableIndices.get(name),
  }));

  return (values) => {
    const locals = outerBindings.length === 0 ? NO_LOCALS : outerBindings.map((outer) => readOuterValue(outer, values));
    return compiled.evaluate(values, locals) ?? Number.NaN;
  };
};
