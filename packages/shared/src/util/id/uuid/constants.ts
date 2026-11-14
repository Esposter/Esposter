/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands every exported constant's annotation */
// The all-zero v7 UUID: the id a fixture or a sentinel carries when its value is pinned, because nothing reads it or
// Because the code under test seeds from its text. It is v7-shaped (the version digit 7 and the variant digit 8) because
// Every id here validates as a v7, which the nil UUID does not; a second row of the same table steps the last digit
export const ZERO_UUID: string = "00000000-0000-7000-8000-000000000000";
