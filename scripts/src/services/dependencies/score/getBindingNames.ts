// The local names an import's bindings introduce, whether `a`, `b as c`, `* as ns` or `Default, { x }`
export const getBindingNames = (bindings: string): string[] =>
  bindings
    .replaceAll(/[{}*]/gu, " ")
    .split(",")
    .flatMap((part) => {
      const words = part
        .trim()
        .split(/\s+/u)
        .filter((word) => word !== "" && word !== "as" && word !== "type");
      const name = words.at(-1);
      return name === undefined ? [] : [name];
    });
