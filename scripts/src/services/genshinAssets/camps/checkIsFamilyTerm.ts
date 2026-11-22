import { stripElementWords } from "#src/services/genshinAssets/camps/stripElementWords";

// Whether a name is a family term of a form, or the form a family term of the name: the name is the form, a variant of it
// (Fatui Skirmisher - Geochanter Bracer, Abyss Herald: Frost Fall, Cryo Abyss Mage), or the form is a variant the name
// Is the family of (Fatui Mirror Maiden is the family of Mirror Maiden)
export const checkIsFamilyTerm = (name: string, form: string): boolean =>
  name === form ||
  name.startsWith(`${form}:`) ||
  name.startsWith(`${form} -`) ||
  name.endsWith(` ${form}`) ||
  stripElementWords(name) === form ||
  form.endsWith(` ${name}`);
