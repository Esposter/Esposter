// https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
export const getRandomValues = <T>(values: T[], takenLength: number) => {
  if (!Number.isInteger(takenLength)) throw new TypeError(`${getRandomValues.name}: taken length must be an integer`);
  else if (takenLength < 0) throw new RangeError(`${getRandomValues.name}: taken length is negative`);
  else if (takenLength === 0) return [];

  let length = values.length;
  if (takenLength > length) throw new RangeError(`${getRandomValues.name}: more elements taken than available`);

  const resultValues: T[] = [];
  const takenValues: number[] = [];

  while (takenLength--) {
    const x = Math.floor(Math.random() * length);
    resultValues[takenLength] = values[x in takenValues ? takenValues[x] : x];
    takenValues[x] = --length in takenValues ? takenValues[length] : length;
  }

  return resultValues;
};
