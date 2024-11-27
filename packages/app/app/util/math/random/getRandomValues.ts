export const getRandomValues = <T>(values: T[], n: number) => {
  let length = values.length;
  const result = new Array<T>(n);
  const taken = new Array(length);

  if (n > length) throw new RangeError(`${getRandomValues.name}: more elements taken than available`);

  while (n--) {
    const x = Math.floor(Math.random() * length);
    result[n] = values[x in taken ? taken[x] : x];
    taken[x] = --length in taken ? taken[length] : length;
  }

  return result;
};
