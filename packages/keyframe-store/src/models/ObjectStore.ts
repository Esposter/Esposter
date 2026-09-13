// The backend the store is given: bytes by key, and nothing else. Keys are content addresses, so a backend may
// Scope them under any prefix it likes, and an object once written is never written again under the same key
export interface ObjectStore {
  delete: (keys: string[]) => Promise<void>;
  // `byteCount` asks for the head of the object only, which is all a deduplicated write reads. A backend that
  // Serves ranges honours it and one that cannot hands back the whole object — the reader only looks at the
  // Head either way. Undefined when nothing is stored under the key
  read: (key: string, byteCount?: number) => Promise<Uint8Array | undefined>;
  // Create-only, and it says whether this call created the object: false when one already stood under the key,
  // Which a backend answers from its own conditional write rather than from a read that races it. Two writers of
  // The same content both pass the store's head read, and the one that lands second must learn it lost, because
  // The object under the key is its twin's — with the twin's base — and not the one it encoded
  write: (key: string, bytes: Uint8Array) => Promise<boolean>;
}
