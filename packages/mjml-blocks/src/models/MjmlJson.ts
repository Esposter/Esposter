// MJML's JSON form, the object mjml2html takes in place of markup. A boolean attribute is written as a boolean, the only
// Form MJML's strict validation accepts for one in JSON
export type MjmlJson =
  | { attributes: Record<string, string | boolean>; children: MjmlJson[]; tagName: string }
  | { attributes: Record<string, string | boolean>; content: string; tagName: string }
  | { attributes: Record<string, string | boolean>; tagName: string };
