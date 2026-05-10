// @vitest-environment nuxt
import type { Router } from "vue-router";

import { useDataStore } from "@/store/message/data";
import { useReplyStore } from "@/store/message/input/reply";
import { MessageType } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(useDataStore, () => {
  let router: Router;
  const roomId = crypto.randomUUID();

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    router.currentRoute.value.params.id = roomId;
  });

  describe("storeSendMessage", () => {
    test("clears replyRowKey via ResetSend hook before createMessage runs", async () => {
      expect.hasAssertions();

      const replyStore = useReplyStore();
      const { rowKey } = storeToRefs(replyStore);
      const dataStore = useDataStore();
      const { storeSendMessage } = dataStore;
      rowKey.value = " ";

      await storeSendMessage({ message: "", roomId, type: MessageType.Message });

      expect(rowKey.value).toBe("");
    });
  });
});
