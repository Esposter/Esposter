// Blank lines take the continuation prefix without its trailing space, so a quote stays one quote across its paragraphs
export const prefixLines = (body: string, firstPrefix: string, restPrefix: string) =>
  body
    .split("\n")
    .map((line, index) => {
      const prefix = index === 0 ? firstPrefix : restPrefix;
      return line === "" ? prefix.trimEnd() : `${prefix}${line}`;
    })
    .join("\n");
