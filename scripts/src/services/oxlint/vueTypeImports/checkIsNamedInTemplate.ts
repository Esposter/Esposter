// Vue's own hyphenation, which writes a component import's tag: `MyThing` is `<my-thing>`
const hyphenate = (name: string): string => name.replaceAll(/\B(?<letter>[A-Z])/gu, "-$<letter>").toLowerCase();

// A binding the template names is a value there, under either spelling a component is written in
export const checkIsNamedInTemplate = (name: string, templateWords: Set<string>): boolean =>
  templateWords.has(name) || templateWords.has(hyphenate(name));
