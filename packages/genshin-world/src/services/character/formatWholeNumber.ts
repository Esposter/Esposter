// A stat rounded to a whole number, with the thousands grouped the way the game writes them
export const formatWholeNumber = (value: number): string => Math.round(value).toLocaleString("en-US");
