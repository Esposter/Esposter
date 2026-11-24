import { Element } from "genshin-world/definitions";

const ELEMENT_WORDS: ReadonlySet<string> = new Set(Object.keys(Element));
// A name with its element words dropped, so that Fatui Pyro Agent is a Fatui Agent
export const stripElementWords = (name: string): string =>
  name
    .split(" ")
    .filter((word) => !ELEMENT_WORDS.has(word))
    .join(" ");
