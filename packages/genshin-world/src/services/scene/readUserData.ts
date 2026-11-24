// A three object's userData is an untyped record, so a value read from it is the type the caller states here. The
// Record is read at runtime under a key the caller names, which the compiler cannot relate to the type it is read as
/* oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the type is named by the caller and carried
   only by the return, which is the point of the helper */
export const readUserData = <TValue>(userData: Record<string, unknown>, key: string): TValue =>
  /* oxlint-disable-next-line typescript/no-unsafe-type-assertion -- userData is an untyped record, so the value under
     the key is the type the caller states for it */
  userData[key] as TValue;
