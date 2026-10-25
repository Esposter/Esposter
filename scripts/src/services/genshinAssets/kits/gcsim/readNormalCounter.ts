// The hit counter a normal attack's table index reads, the action's own number, as its path names `normalAttacks.<n>`
const NORMAL_ATTACK_PATH_REGEX = /^normalAttacks\.(?<counter>\d+)\./u;

export const readNormalCounter = (path: string): number | undefined => {
  const counter = NORMAL_ATTACK_PATH_REGEX.exec(path)?.groups?.counter;
  return counter === undefined ? undefined : Number(counter);
};
