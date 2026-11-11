/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands every exported constant's annotation */
export const UUIDV4_REGEX: RegExp = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/iu;
// The all-zero v4 UUID: the id a fixture or a sentinel carries when its value is pinned, because nothing reads it or
// Because the code under test seeds from its text. It is v4-shaped (the version digit 4 and the variant digit 8) because
// Every id here validates as a v4, which the nil UUID does not; a second row of the same table steps the last digit
export const ZERO_UUID: string = "00000000-0000-4000-8000-000000000000";
