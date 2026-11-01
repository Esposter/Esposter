// The content holds an element when a `<`, followed by a letter or by `/` and a letter, lies before the last `>`. The
// Text up to that `>` is searched once, since a `<[^>]*>` pattern rescans to the end from every `<` of an unclosed run
export const checkHasElement = (html: string): boolean => {
  const lastTagEnd = html.lastIndexOf(">");
  return lastTagEnd !== -1 && /<\/?[a-z]/iu.test(html.slice(0, lastTagEnd));
};
