import { findNonSpace } from "./findNonSpace";

const MODEL_KEY = "model";
const MODEL_KEY_REGEX = /(?<![\w$])model(?![\w$])/gu;
const HAIKU = "haiku";

// Whether the options object between openIndex and closeIndex names the haiku model as its one `model` key, at its own
// top level, with a plain quoted literal as the value. A spread, a computed key, a quoted or escaped key, a second or
// non-key `model` and any value beyond the literal each refuse it, since each could move the model somewhere else
export const checkIsHaikuOptions = (script: string, code: string, openIndex: number, closeIndex: number): boolean => {
  let depth = 0;
  let topLevel = "";
  for (let index = openIndex + 1; index < closeIndex; index++) {
    const character = code.charAt(index);
    if (depth === 0 && (character === "[" || code.startsWith("...", index))) return false;
    if (depth === 0 && /['"]/u.test(character)) {
      const stringText = script.slice(index + 1, code.indexOf(character, index + 1));
      if (stringText === MODEL_KEY || stringText.includes("\\")) return false;
    }
    if (/[([{]/u.test(character)) depth++;
    else if (/[)\]}]/u.test(character)) depth--;
    topLevel += depth === 0 && !/[()[\]{}]/u.test(character) ? character : " ";
  }
  const keys = [...topLevel.matchAll(MODEL_KEY_REGEX)];
  const [key] = keys;
  if (keys.length !== 1 || key === undefined) return false;
  const keyEnd = openIndex + 1 + key.index + MODEL_KEY.length;
  const colon = findNonSpace(code, keyEnd, closeIndex);
  if (code.charAt(colon) !== ":") return false;
  const quote = findNonSpace(code, colon + 1, closeIndex);
  const quoteCharacter = code.charAt(quote);
  if (quoteCharacter !== "'" && quoteCharacter !== '"') return false;
  const valueEnd = quote + 1 + HAIKU.length;
  if (script.slice(quote + 1, valueEnd) !== HAIKU || script.charAt(valueEnd) !== quoteCharacter) return false;
  const afterValue = findNonSpace(code, valueEnd + 1, closeIndex);
  return afterValue === closeIndex || code.charAt(afterValue) === ",";
};
