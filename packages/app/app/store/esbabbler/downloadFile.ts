import type { DownloadFileUrl } from "@/models/esbabbler/file/DownloadFileUrl";

import { MessageHookMap } from "@/services/esbabbler/message/MessageHookMap";
import { createDataMap } from "@/services/shared/createDataMap";
import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";
import { Operation } from "@esposter/shared";
import { api as viewerApi } from "v-viewer";

export const useDownloadFileStore = defineStore("esbabbler/downloadFile", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const messageStore = useMessageStore();
  const { data: fileUrlMap } = createDataMap(() => roomStore.currentRoomId, new Map<string, DownloadFileUrl>());
  MessageHookMap[Operation.Create].push(async (message) => {
    if (!roomStore.currentRoomId || message.files.length === 0) return;

    const downloadFileSasUrls = await $trpc.message.generateDownloadFileSasUrls.query({
      files: message.files,
      roomId: roomStore.currentRoomId,
    });

    for (let i = 0; i < message.files.length; i++)
      fileUrlMap.value.set(message.files[i].id, { url: downloadFileSasUrls[i] });
  });
  MessageHookMap[Operation.Delete].push((input) => {
    const message = messageStore.messages.find(({ rowKey }) => rowKey === input.rowKey);
    if (!message) return;
    for (const { id } of message.files) fileUrlMap.value.delete(id);
  });
  const images = computed(() => {
    const images: { alt: string; src: string }[] = [];
    for (const { filename, id } of messageStore.files) {
      const fileUrl = fileUrlMap.value.get(id);
      if (!fileUrl) continue;
      images.push({ alt: filename, src: fileUrl.url });
    }
    return images;
  });

  const viewFiles = (initialViewIndex: number) => {
    viewerApi({ images: images.value, options: { initialViewIndex } });
  };

  return { fileUrlMap, viewFiles };
});
