// The polynomial's degree across and up the frame: a sky's gradient bends up the frame toward its horizon and across it
// Toward its sun, smoothly, and a cubic holds both while no cloud's few hundred pixels fit into it
const DEGREE = 3;

// The terms of a cubic in a pixel's place, each axis scaled to [-1, 1]
export const computeTerms = (x: number, y: number): number[] => {
  const terms: number[] = [];
  for (let yPower = 0; yPower <= DEGREE; yPower++)
    for (let xPower = 0; xPower + yPower <= DEGREE; xPower++) terms.push(x ** xPower * y ** yPower);
  return terms;
};
