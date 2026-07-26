import type { ReadFileUrl } from "@/models/message/file/ReadFileUrl";

import { getInferredMimetype } from "@/services/file/getInferredMimetype";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { Operation } from "@esposter/shared";
import { api as viewerApi } from "v-viewer";

export const useDownloadFileStore = defineStore("message/file", () => {
  const roomStore = useRoomStore();
  const dataStore = useDataStore();
  const readFileUrls = useReadFileUrls();
  const { data: fileUrlMap } = useDataMap(() => roomStore.currentRoomId, new Map<string, ReadFileUrl>());
  MessageHookMap[Operation.Create].register(async (message) => {
    if (!roomStore.currentRoomId || message.files.length === 0) return;

    const newFileUrlMap = await readFileUrls(message.files, roomStore.currentRoomId);
    for (const [id, fileUrl] of newFileUrlMap) fileUrlMap.value.set(id, fileUrl);
  });
  MessageHookMap[Operation.Delete].register((input) => {
    const message = dataStore.items.find(({ rowKey }) => rowKey === input.rowKey);
    if (!message) return;
    for (const { id } of message.files) fileUrlMap.value.delete(id);
  });

  const viewableFiles = computed(() => {
    const viewerImages: { alt: string; id: string; src: string }[] = [];
    for (const { filename, id, mimetype } of dataStore.files) {
      const fileUrl = fileUrlMap.value.get(id);
      if (!fileUrl) continue;
      const inferredMimetype = getInferredMimetype(mimetype);
      if (inferredMimetype !== "image") continue;
      viewerImages.push({ alt: filename, id, src: fileUrl.url });
    }
    return viewerImages;
  });
  const viewFiles = (initialViewIndex: number) => {
    viewerApi({ images: viewableFiles.value, options: { initialViewIndex } });
  };

  return { fileUrlMap, viewableFiles, viewFiles };
});
