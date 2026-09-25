/* eslint-disable no-restricted-syntax -- each member is the standard format token itself, whose casing is its meaning (`MM` a month, `mm` a minute) */
// The subset of dayjs's format tokens this repo's format strings are written in. The order they are declared in
// Is free: the tokenizer orders them longest first itself (DATE_TOKEN_REGEX)
export enum DateToken {
  A = "A",
  D = "D",
  DD = "DD",
  ddd = "ddd",
  dddd = "dddd",
  Do = "Do",
  H = "H",
  h = "h",
  HH = "HH",
  hh = "hh",
  M = "M",
  MM = "MM",
  mm = "mm",
  MMM = "MMM",
  MMMM = "MMMM",
  ss = "ss",
  YYYY = "YYYY",
  Z = "Z",
}

export const DateTokens = Object.values(DateToken);
