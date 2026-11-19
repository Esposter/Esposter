// A slot's overrides, cleared when the draft that wrote them ends
export interface DraftHandle {
  clear: () => void;
}
