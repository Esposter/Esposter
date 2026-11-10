// The all-zero v4 UUID: the id a fixture or a sentinel carries when nothing about the value is read. It is v4-shaped
// (the version digit 4 and the variant digit 8) because every id here is a v4 and validates as one, which the nil UUID
// Does not; a second row of the same table steps the last digit
export const ZERO_UUID = "00000000-0000-4000-8000-000000000000";
