import type { ConstantLoop } from "#src/models/genshinAssets/kits/gcsim/ConstantLoop";

// The variable values of every iteration a position is in, one map each, of its enclosing constant loops taken together
export const readIterations = (loops: readonly ConstantLoop[], position: number): Map<string, number>[] =>
  loops
    .filter(({ bodyEnd, bodyStart }) => bodyStart < position && position < bodyEnd)
    .reduce<Map<string, number>[]>(
      (iterations, { iterations: loopIterations }) =>
        iterations.flatMap((iteration) =>
          loopIterations.map((loopIteration) => new Map([...iteration, ...loopIteration])),
        ),
      [new Map()],
    );
