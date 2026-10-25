import { createRandomInteger } from "@/util/math/random/createRandomInteger";

// A bubble-chart demo series: x and y are the axis coordinates, z the bubble size. Every range below includes both of
// Its ends, and the random helper's maximum is exclusive, so each maximum is one above the largest value wanted
export const createData = (count: number, { maximum, minimum }: { maximum: number; minimum: number }) => {
  const series: [number, number, number][] = [];
  for (let index = 0; index < count; index++) {
    const x = createRandomInteger(751, 1);
    const y = createRandomInteger(maximum + 1, minimum);
    const z = createRandomInteger(76, 15);
    series.push([x, y, z]);
  }
  return series;
};
