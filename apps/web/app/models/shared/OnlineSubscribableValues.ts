import type { OnlineSubscribableSource } from "@/models/shared/OnlineSubscribableSource";
import type { WatchSource } from "vue";

export type OnlineSubscribableValues<TSources extends readonly OnlineSubscribableSource[]> = {
  -readonly [K in keyof TSources]: TSources[K] extends WatchSource<infer V> ? V : TSources[K];
};
