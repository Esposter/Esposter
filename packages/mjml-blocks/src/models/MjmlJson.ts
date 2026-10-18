// MJML's JSON form, the object mjml2html takes in place of markup. A boolean attribute is written as a boolean, the only
// Form MJML's strict validation accepts for one in JSON
export type MjmlJson =
  | { attributes: Record<string, boolean | string>; children: MjmlJson[]; tagName: string }
  | { attributes: Record<string, boolean | string>; content: string; tagName: string }
  | { attributes: Record<string, boolean | string>; tagName: string };
