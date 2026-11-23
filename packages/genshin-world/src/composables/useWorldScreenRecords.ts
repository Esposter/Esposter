import type { ScreenKind } from "#src/models/screen/ScreenKind";
import type { ScreenRecordKey } from "#src/models/screen/ScreenRecordKey";
import type { ScreenRecords } from "#src/models/screen/ScreenRecords";

import { ScreenRecordKeysMap } from "#src/services/screen/ScreenRecordKeysMap";
import { ScreenRecordLoaderMap } from "#src/services/screen/ScreenRecordLoaderMap";
import { useWorldScreenStore } from "#src/store/screen";
import { getResultAsync } from "@esposter/shared";
import { storeToRefs } from "pinia";
import { shallowReactive, watch } from "vue";

// Holds a read record under its key, its value typed by that key
const holdRecord = <K extends ScreenRecordKey>(records: Partial<ScreenRecords>, key: K, record: ScreenRecords[K]) => {
  records[key] = record;
};

// The records a screen reads, read the first time its screen opens and held after, so the world's first frame reads
// None of them. A record that fails to read is logged and its screen closed, since a screen left open without its
// Record Has nothing to draw, and the next open reads it again
export const useWorldScreenRecords = ({ gameDataBaseUrl }: { gameDataBaseUrl: string }) => {
  const worldScreenStore = useWorldScreenStore();
  const { closeScreen } = worldScreenStore;
  const { screenKind } = storeToRefs(worldScreenStore);
  const records = shallowReactive<Partial<ScreenRecords>>({});
  const readingKeys = new Set<ScreenRecordKey>();
  const readRecord = (screen: ScreenKind, key: ScreenRecordKey) => {
    if (records[key] !== undefined || readingKeys.has(key)) return;
    readingKeys.add(key);
    // `match(`) handles both branches, so the promise
    // oxlint-disable-next-line typescript/no-floating-promises -- it returns cannot reject and nothing waits on it
    getResultAsync((): Promise<ScreenRecords[ScreenRecordKey]> => ScreenRecordLoaderMap[key](gameDataBaseUrl)).match(
      (record) => {
        holdRecord(records, key, record);
      },
      (error) => {
        readingKeys.delete(key);
        console.error(error);
        if (screenKind.value === screen) closeScreen();
      },
    );
  };
  watch(screenKind, (kind) => {
    for (const key of ScreenRecordKeysMap[kind] ?? []) readRecord(kind, key);
  });
  return records;
};
