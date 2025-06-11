// https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
export const getRandomValues = <T>(values: T[], n: number) => {
  let length = values.length;
  const result = Array.from<T>({ length: n });
  const taken = Array.from<number>({ length });

  if (n > length) throw new RangeError(`${getRandomValues.name}: more elements taken than available`);

  while (n--) {
    const x = Math.floor(Math.random() * length);
    result[n] = values[x in taken ? taken[x] : x];
    taken[x] = --length in taken ? taken[length] : length;
  }

  return result;
};
