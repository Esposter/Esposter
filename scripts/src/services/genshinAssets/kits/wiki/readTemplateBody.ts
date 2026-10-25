// The template's text from its opening braces to its closing ones, nested templates and all
export const readTemplateBody = (wikitext: string, start: number): string => {
  let depth = 0;
  for (let index = start; index < wikitext.length - 1; index++) {
    const pair = wikitext.slice(index, index + 2);
    if (pair === "{{") {
      depth++;
      index++;
    } else if (pair === "}}") {
      depth--;
      index++;
      if (depth === 0) return wikitext.slice(start + 2, index - 1);
    }
  }
  return wikitext.slice(start + 2);
};
