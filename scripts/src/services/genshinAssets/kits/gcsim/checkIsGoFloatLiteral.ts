// Whether a number token reads as a Go float: one written with a decimal point or an exponent, or a hexadecimal one with
// A binary exponent
export const checkIsGoFloatLiteral = (text: string): boolean =>
  /^0[xX]/u.test(text) ? /[pP]/u.test(text) : /[.eE]/u.test(text);
