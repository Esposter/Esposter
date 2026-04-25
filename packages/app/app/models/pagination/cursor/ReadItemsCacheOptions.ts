export interface ReadItemsCacheOptions<TItem> {
  cache: {
    read: (partitionKey: string) => Promise<TItem[]>;
    write: (items: TItem[], partitionKey: string) => Promise<void>;
  };
  onCacheRead?: () => void;
  partitionKey: string;
}
