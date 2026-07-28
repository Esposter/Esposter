import type { UploadFileUrl } from "@/models/message/file/UploadFileUrl";
import type { FileEntity } from "@esposter/db-schema";

import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useRoomStore } from "@/store/message/room";

export const useUploadFileStore = defineStore("message/input/uploadFile", () => {
  const roomStore = useRoomStore();
  const {
    data: files,
    getData: getFiles,
    setData: setFiles,
  } = useDataMap<FileEntity[]>(() => roomStore.currentRoomId, []);
  const {
    data: fileUrlMap,
    getData: getFileUrlMap,
    setData: setFileUrlMap,
  } = useDataMap(() => roomStore.currentRoomId, new Map<string, UploadFileUrl>());
  const isFileLoading = ref(false);
  // Every composer write is keyed by the room the files were attached TO, never through `files.value` /
  // `fileUrlMap.value`: those resolve to whichever room is CURRENT the moment they are read, and an upload
  // Awaits a SAS round trip and the blob PUTs first. A user who switches rooms during that await would seed
  // One room's attachments into another room's composer — sending there produces a message whose blobs live
  // Under the room they left, so every attachment renders permanently broken — and the matching revert would
  // Find nothing to take back out, stranding the composer it exists to clean up.
  const storeUploadFiles = (roomId: string, uploadFiles: { file: File; id: string }[]) => {
    const roomFiles = getFiles(roomId) ?? [];
    const roomFileUrlMap = getFileUrlMap(roomId) ?? new Map<string, UploadFileUrl>();
    for (const { file, id } of uploadFiles) {
      roomFiles.push({ filename: file.name, hasThumbnail: false, id, mimetype: file.type, size: file.size });
      roomFileUrlMap.set(id, reactive<UploadFileUrl>({ progress: 0, url: URL.createObjectURL(file) }));
    }

    setFiles(roomId, roomFiles);
    setFileUrlMap(roomId, roomFileUrlMap);
  };
  const storeUploadFileProgress = (roomId: string, id: string, progress: number) => {
    const uploadFileUrl = getFileUrlMap(roomId)?.get(id);
    if (uploadFileUrl) uploadFileUrl.progress = progress;
  };
  // Recorded by the only thing that knows it — the upload that wrote the thumbnail blob. The renderer would
  // Otherwise have to infer a missing thumbnail from a failed image load, which is the same signal an expired
  // Read SAS gives it.
  const storeUploadFileThumbnails = (roomId: string, ids: string[]) => {
    const roomFiles = getFiles(roomId);
    if (!roomFiles) return;

    const idSet = new Set(ids);
    for (const file of roomFiles) if (idSet.has(file.id)) file.hasThumbnail = true;
    setFiles(roomId, roomFiles);
  };
  // Returns what it took out, because a revert has to name those files to the server to reclaim their blobs
  const removeUploadFiles = (roomId: string, ids: string[]): FileEntity[] => {
    const idSet = new Set(ids);
    const roomFileUrlMap = getFileUrlMap(roomId);
    if (roomFileUrlMap)
      for (const id of ids) {
        const uploadFileUrl = roomFileUrlMap.get(id);
        if (!uploadFileUrl) continue;

        URL.revokeObjectURL(uploadFileUrl.url);
        roomFileUrlMap.delete(id);
      }

    const roomFiles = getFiles(roomId) ?? [];
    const removedFiles = roomFiles.filter(({ id }) => idSet.has(id));
    setFiles(
      roomId,
      roomFiles.filter(({ id }) => !idSet.has(id)),
    );
    return removedFiles;
  };
  // The one place the current room may stand in for a captured room id, and only for the composer's own delete
  // Affordance: nothing awaits between that click and the write, so the two cannot disagree. Anything reached
  // Through a hook or a resolved send captures its room instead — the await is where they come apart.
  const removeCurrentUploadFiles = (ids: string[]) => {
    const roomId = roomStore.currentRoomId;
    if (!roomId) return;

    removeUploadFiles(roomId, ids);
  };
  // Keyed by the room the send was for, like every other composer write here: the reset runs behind the optimistic
  // Bubble, so the current room can already be a different one by the time it fires
  MessageHookMap.ResetSend.register((roomId) => {
    removeUploadFiles(roomId, getFiles(roomId)?.map(({ id }) => id) ?? []);
  });
  return {
    files,
    fileUrlMap,
    isFileLoading,
    removeCurrentUploadFiles,
    removeUploadFiles,
    storeUploadFileProgress,
    storeUploadFiles,
    storeUploadFileThumbnails,
  };
});
