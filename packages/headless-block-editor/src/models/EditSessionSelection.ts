// How a session reads its selected node off its document as it stands: the pointer an id names, and the id a pointer names
export interface EditSessionSelection<TDocument> {
  getIdByPointer: (document: TDocument, nodePointer: string) => string;
  getPointerById: (document: TDocument, id: string) => string;
}
