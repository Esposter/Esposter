// The Nelder–Mead simplex's coefficients: reflection, expansion, contraction and shrink, as the method sets them
const REFLECTION = 1;
const EXPANSION = 2;
const CONTRACTION = 0.5;
const SHRINK = 0.5;

const combine = (from: readonly number[], to: readonly number[], share: number): number[] =>
  from.map((value, index) => value + share * ((to[index] ?? 0) - value));
// The point of lowest cost the simplex reaches from a start, one step along each axis setting its first size, over a
// Cost that is costly to evaluate (a render and its score) and has no gradient. Each evaluation is awaited in turn
export const minimizeNelderMead = async (
  cost: (point: number[]) => Promise<number>,
  start: readonly number[],
  steps: readonly number[],
  iterationCount: number,
): Promise<{ cost: number; point: number[] }> => {
  const evaluate = async (point: number[]): Promise<{ cost: number; point: number[] }> => ({
    cost: await cost(point),
    point,
  });
  const vertices = [await evaluate([...start])];
  for (const [axis, step] of steps.entries())
    // oxlint-disable-next-line no-await-in-loop -- each vertex is one evaluation, and evaluations run one at a time
    vertices.push(await evaluate(start.map((value, index) => (index === axis ? value + step : value))));
  for (let iteration = 0; iteration < iterationCount; iteration++) {
    vertices.sort((first, second) => first.cost - second.cost);
    const worst = vertices.at(-1);
    const best = vertices[0];
    const secondWorst = vertices.at(-2);
    if (!worst || !best || !secondWorst) break;
    const others = vertices.slice(0, -1);
    const centroid = start.map(
      (_, index) => others.reduce((sum, { point }) => sum + (point[index] ?? 0), 0) / others.length,
    );
    // oxlint-disable-next-line no-await-in-loop -- as above
    const reflected = await evaluate(combine(centroid, worst.point, -REFLECTION));
    if (reflected.cost < best.cost) {
      // oxlint-disable-next-line no-await-in-loop -- as above
      const expanded = await evaluate(combine(centroid, worst.point, -EXPANSION));
      vertices[vertices.length - 1] = expanded.cost < reflected.cost ? expanded : reflected;
    } else if (reflected.cost < secondWorst.cost) vertices[vertices.length - 1] = reflected;
    else {
      // oxlint-disable-next-line no-await-in-loop -- as above
      const contracted = await evaluate(combine(centroid, worst.point, CONTRACTION));
      if (contracted.cost < worst.cost) vertices[vertices.length - 1] = contracted;
      else
        for (let index = 1; index < vertices.length; index++)
          // oxlint-disable-next-line no-await-in-loop -- as above
          vertices[index] = await evaluate(combine(best.point, vertices[index]?.point ?? [], SHRINK));
    }
  }
  vertices.sort((first, second) => first.cost - second.cost);
  return vertices[0] ?? { cost: Number.POSITIVE_INFINITY, point: [...start] };
};
