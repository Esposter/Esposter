// The backend the store is given: bytes by key, and nothing else. Keys are content addresses, so a backend may
// Scope them under any prefix it likes, and an object once written is never written again under the same key
export interface ObjectStore {
  delete: (keys: string[]) => Promise<void>;
  // `byteCount` asks for the head of the object only, which is all a deduplicated write reads. A backend that
  // Serves ranges honours it and one that cannot hands back the whole object — the reader only looks at the
  // Head either way. Undefined when nothing is stored under the key
  read: (key: string, byteCount?: number) => Promise<undefined | Uint8Array>;
  write: (key: string, bytes: Uint8Array) => Promise<void>;
}
