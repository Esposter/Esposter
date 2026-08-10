// A bubble-chart demo series: x and y are the axis coordinates, z the bubble size.
export const createData = (count: number, { maximum, minimum }: { maximum: number; minimum: number }) => {
  const series: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * (750 - 1 + 1)) + 1;
    const y = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    const z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;
    series.push([x, y, z]);
  }
  return series;
};
