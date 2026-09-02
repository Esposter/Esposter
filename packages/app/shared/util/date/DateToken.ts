/* eslint-disable perfectionist/sort-enums */
// The subset of dayjs's format tokens this repo's format strings are written in. Declaration order is the
// Contract, not a style: the tokenizer alternates over these in order, so a shorter token listed before its
// Longer sibling (`M` before `MMMM`) would claim the first letter and leave the rest as literal text.
export enum DateToken {
  YYYY = "YYYY",
  MMMM = "MMMM",
  MMM = "MMM",
  MM = "MM",
  M = "M",
  dddd = "dddd",
  ddd = "ddd",
  DD = "DD",
  Do = "Do",
  D = "D",
  HH = "HH",
  H = "H",
  hh = "hh",
  h = "h",
  mm = "mm",
  ss = "ss",
  A = "A",
  Z = "Z",
}

export const DateTokens = Object.values(DateToken);
