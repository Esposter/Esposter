export type MergeObjectsStrict<T extends object[]> = HasSharedKey<T> extends true ? never : Intersect<T>;

// Whether any two of the objects share a key: each is compared with every object after it, not only its neighbour
type HasSharedKey<T extends object[]> = T extends [infer TFirst, ...infer TRemaining extends object[]]
  ? [keyof TFirst & KeysOf<TRemaining[number]>] extends [never]
    ? HasSharedKey<TRemaining>
    : true
  : false;
type Intersect<T extends object[]> = T extends [infer TFirst, ...infer TRemaining extends object[]]
  ? Intersect<TRemaining> & TFirst
  : unknown;
// Every key of each object in a union, rather than the keys the union's members share
type KeysOf<T> = T extends object ? keyof T : never;
