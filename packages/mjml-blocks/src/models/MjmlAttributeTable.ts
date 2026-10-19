// A table of attributes shared by components of one shape: the attributes each takes in MJML's grammar, and the defaults MJML sets for them
export interface MjmlAttributeTable {
  allowedAttributes: Record<string, string>;
  defaultAttributes: Record<string, string>;
}
