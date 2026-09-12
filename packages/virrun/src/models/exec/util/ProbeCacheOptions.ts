import type { KeyedCache } from "#src/models/exec/KeyedCache";

export interface ProbeCacheOptions<TValue> {
  probe: () => TValue;
  readPersistedCache: (key: string) => TValue | undefined;
  shouldPersist: (value: TValue) => boolean;
  writePersistedCache: (cache: Pick<KeyedCache<TValue>, "key" | "value">) => void;
}
