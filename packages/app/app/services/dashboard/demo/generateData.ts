/*
  Generate output in this format:
  Every array in data is of the format [x, y, z] where x (timestamp) and y are the two axes coordinates,
  z is the third coordinate, which you can interpret as the size of the bubble formed too.
  data = [
     [timestamp, 23, 10],
     [timestamp, 33, 11],
     [timestamp, 12, 8]
      ...
  ]
  */
export const generateData = (count: number, { max, min }: { max: number; min: number }) => {
  const series: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * (750 - 1 + 1)) + 1;
    const y = Math.floor(Math.random() * (max - min + 1)) + min;
    const z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;
    series.push([x, y, z]);
  }
  return series;
};
