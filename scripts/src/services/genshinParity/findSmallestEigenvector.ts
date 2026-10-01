// The eigenvector of a symmetric matrix belonging to its smallest eigenvalue, by cyclic Jacobi rotations until the
// Off-diagonal entries vanish: what least squares takes for the null space of a homogeneous system
const SWEEP_LIMIT = 100;
const OFF_DIAGONAL_TOLERANCE = 1e-12;
const at = (rows: readonly number[][], row: number, column: number): number => rows[row]?.[column] ?? 0;
const set = (rows: number[][], row: number, column: number, value: number): void => {
  const target = rows[row];
  if (target) target[column] = value;
};
export const findSmallestEigenvector = (symmetric: readonly number[][]): number[] => {
  const size = symmetric.length;
  const matrix = symmetric.map((row) => [...row]);
  const vectors = Array.from({ length: size }, (_row, row) =>
    Array.from({ length: size }, (_column, column) => Number(row === column)),
  );
  for (let sweep = 0; sweep < SWEEP_LIMIT; sweep++) {
    let offDiagonal = 0;
    for (let p = 0; p < size; p++) for (let q = p + 1; q < size; q++) offDiagonal += at(matrix, p, q) ** 2;
    if (offDiagonal < OFF_DIAGONAL_TOLERANCE) break;
    for (let p = 0; p < size; p++)
      for (let q = p + 1; q < size; q++) {
        const apq = at(matrix, p, q);
        if (Math.abs(apq) < Number.MIN_VALUE) continue;
        const theta = (at(matrix, q, q) - at(matrix, p, p)) / (2 * apq);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.hypot(theta, 1));
        const c = 1 / Math.hypot(t, 1);
        const s = t * c;
        for (let k = 0; k < size; k++) {
          const akp = at(matrix, k, p);
          const akq = at(matrix, k, q);
          set(matrix, k, p, c * akp - s * akq);
          set(matrix, k, q, s * akp + c * akq);
        }
        for (let k = 0; k < size; k++) {
          const apk = at(matrix, p, k);
          const aqk = at(matrix, q, k);
          set(matrix, p, k, c * apk - s * aqk);
          set(matrix, q, k, s * apk + c * aqk);
        }
        for (let k = 0; k < size; k++) {
          const vkp = at(vectors, k, p);
          const vkq = at(vectors, k, q);
          set(vectors, k, p, c * vkp - s * vkq);
          set(vectors, k, q, s * vkp + c * vkq);
        }
      }
  }
  let smallest = 0;
  for (let index = 1; index < size; index++)
    if (at(matrix, index, index) < at(matrix, smallest, smallest)) smallest = index;
  return vectors.map((row) => row[smallest] ?? 0);
};
