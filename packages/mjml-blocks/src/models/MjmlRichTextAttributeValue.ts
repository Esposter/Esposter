// A rich text attribute's value as JSON holds it: a scalar, or a list or an object of further values
export type MjmlRichTextAttributeValue =
  | { [key: string]: MjmlRichTextAttributeValue }
  | boolean
  | MjmlRichTextAttributeValue[]
  | number
  | string;
