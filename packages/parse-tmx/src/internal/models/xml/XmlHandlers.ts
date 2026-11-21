// What a reader of an XML document is told, in document order: each element as it opens with its attributes decoded and
// Normalised, each element as it closes, and its character data, CDATA sections included, as one or more pieces
export interface XmlHandlers {
  onCloseTag: (name: string) => void;
  onOpenTag: (name: string, attributes: Record<string, string>) => void;
  onText: (text: string) => void;
}
