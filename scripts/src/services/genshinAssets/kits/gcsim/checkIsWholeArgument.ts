// Whether the span of a text at an offset is a whole argument of a call, between the call's opening parenthesis or a
// Comma before it and a comma or the closing parenthesis after it
export const checkIsWholeArgument = (text: string, offset: number, length: number): boolean =>
  /(?:^|[(,])\s*$/u.test(text.slice(0, offset)) && /^\s*[),]/u.test(text.slice(offset + length));
