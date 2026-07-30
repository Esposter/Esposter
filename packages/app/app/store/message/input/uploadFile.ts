import type { UploadFileUrl } from "@/models/message/file/UploadFileUrl";
import type { FileEntity } from "@esposter/db-schema";

import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useRoomStore } from "@/store/message/room";
import { getResultAsync, noop } from "@esposter/shared";

export const useUploadFileStore = defineStore("message/input/uploadFile", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const {
    data: allFiles,
    getData: getFiles,
    setData: setFiles,
  } = useDataMap<FileEntity[]>(() => roomStore.currentRoomId, []);
  // The attachments a send has taken but the server has not answered for. Tracked as ids rather than moved out
  // Of `allFiles`, because everything that makes a rejection recoverable — the upload grant, the preview url —
  // Hangs off the row, and removing the row destroys both
  const {
    data: sendingFileIds,
    getData: getSendingFileIds,
    setData: setSendingFileIds,
  } = useDataMap(() => roomStore.currentRoomId, new Set<string>());
  // The composer's own view, which is also the send's payload source and the delete affordance's list: an
  // Attachment in flight is in none of them, so the next Enter cannot post a second message naming its blob
  const files = computed(() => allFiles.value.filter(({ id }) => !sendingFileIds.value.has(id)));
  const {
    data: fileUrlMap,
    getData: getFileUrlMap,
    setData: setFileUrlMap,
  } = useDataMap(() => roomStore.currentRoomId, new Map<string, UploadFileUrl>());
  // The grant minted with each write target, kept for as long as the composer holds the file: it is the only
  // Thing that authorizes deleting an upload no message references yet, and the upload that received it returns
  // Long before the user decides which attachments to keep. Held here rather than in that closure is what lets
  // Every path that drops a file reclaim its blobs instead of only the one that failed mid-upload.
  const { getData: getUploadTokenMap, setData: setUploadTokenMap } = useDataMap(
    () => roomStore.currentRoomId,
    new Map<string, string>(),
  );
  // Counted per room, never a single flag: a second drop lands while the first is still writing, and one
  // Boolean cleared by whichever batch finishes first re-enables Send while the other's blobs are still in
  // Flight — the send then names files the failing batch is about to delete. A count also keeps an upload in
  // One room from gating the composer in every other.
  const {
    data: uploadingCount,
    getData: getUploadingCount,
    setData: setUploadingCount,
  } = useDataMap(() => roomStore.currentRoomId, 0);
  const isFileLoading = computed(() => uploadingCount.value > 0);
  const storeUploadStart = (roomId: string) => {
    setUploadingCount(roomId, (getUploadingCount(roomId) ?? 0) + 1);
  };
  const storeUploadEnd = (roomId: string) => {
    setUploadingCount(roomId, Math.max((getUploadingCount(roomId) ?? 0) - 1, 0));
  };
  // Every composer write is keyed by the room the files were attached TO, never through `files.value` /
  // `fileUrlMap.value`: those resolve to whichever room is CURRENT the moment they are read, and an upload
  // Awaits a SAS round trip and the blob PUTs first. A user who switches rooms during that await would seed
  // One room's attachments into another room's composer — sending there produces a message whose blobs live
  // Under the room they left, so every attachment renders permanently broken — and the matching revert would
  // Find nothing to take back out, stranding the composer it exists to clean up.
  const storeUploadFiles = (roomId: string, uploadFiles: { file: File; id: string; token: string }[]) => {
    const roomFiles = getFiles(roomId) ?? [];
    const roomFileUrlMap = getFileUrlMap(roomId) ?? new Map<string, UploadFileUrl>();
    const roomUploadTokenMap = getUploadTokenMap(roomId) ?? new Map<string, string>();
    for (const { file, id, token } of uploadFiles) {
      roomFiles.push({ filename: file.name, hasThumbnail: false, id, mimetype: file.type, size: file.size });
      roomFileUrlMap.set(id, reactive<UploadFileUrl>({ progress: 0, url: URL.createObjectURL(file) }));
      roomUploadTokenMap.set(id, token);
    }

    setFiles(roomId, roomFiles);
    setFileUrlMap(roomId, roomFileUrlMap);
    setUploadTokenMap(roomId, roomUploadTokenMap);
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
  // Holds the attachments a send took: they stay in the store with their grants, out of the composer, until the
  // Server answers one way or the other
  const holdSendUploadFiles = (roomId: string, ids: string[]) => {
    const roomSendingFileIds = getSendingFileIds(roomId) ?? new Set<string>();
    for (const id of ids) roomSendingFileIds.add(id);
    setSendingFileIds(roomId, roomSendingFileIds);
  };
  // Hands held attachments back to the composer, grants and previews intact
  const releaseSendUploadFiles = (roomId: string, ids: string[]) => {
    const roomSendingFileIds = getSendingFileIds(roomId);
    if (!roomSendingFileIds) return;

    for (const id of ids) roomSendingFileIds.delete(id);
    setSendingFileIds(roomId, roomSendingFileIds);
  };
  // Takes files out of the composer and nothing more — for the send, whose blobs are now referenced by a
  // Persisted message. Returns what it took out, because a discard has to name those files to reclaim them.
  const removeUploadFiles = (roomId: string, ids: string[]): FileEntity[] => {
    const idSet = new Set(ids);
    const roomFileUrlMap = getFileUrlMap(roomId);
    const roomUploadTokenMap = getUploadTokenMap(roomId);
    for (const id of ids) {
      const uploadFileUrl = roomFileUrlMap?.get(id);
      if (uploadFileUrl) {
        URL.revokeObjectURL(uploadFileUrl.url);
        roomFileUrlMap?.delete(id);
      }

      roomUploadTokenMap?.delete(id);
    }

    const roomFiles = getFiles(roomId) ?? [];
    const removedFiles = roomFiles.filter(({ id }) => idSet.has(id));
    setFiles(
      roomId,
      roomFiles.filter(({ id }) => !idSet.has(id)),
    );
    // Whatever brought the row here, it is gone — so the hold that was keeping it out of the composer goes with
    // It, rather than accumulating an id for a row nothing can name again
    releaseSendUploadFiles(roomId, ids);
    return removedFiles;
  };
  // The one way an attachment leaves the composer WITHOUT being sent, and therefore the one place its blobs are
  // Reclaimed: the composer's delete affordance and a failed upload's revert are the same act. Nothing else can
  // Ever name these blobs again — no message references them, so a row dropped without this leaves the original
  // And its thumbnail billed until the whole room is deleted.
  // Best-effort: the composer is already consistent without the server call, and a failure costs storage rather
  // Than correctness, so it never interrupts whatever the user is doing.
  const discardUploadFiles = async (roomId: string, ids: string[]) => {
    const roomUploadTokenMap = getUploadTokenMap(roomId);
    // Read before the removal takes the tokens with it
    const tokens = new Map(
      ids.flatMap((id) => (roomUploadTokenMap?.has(id) ? [[id, roomUploadTokenMap.get(id)]] : [])),
    );
    const removedFiles = removeUploadFiles(roomId, ids);
    const deletedFiles = removedFiles.flatMap(({ filename, id }) => {
      const token = tokens.get(id);
      return token ? [{ filename, id, token }] : [];
    });
    if (deletedFiles.length === 0) return;

    await getResultAsync(() => $trpc.message.deleteUploadFiles.mutate({ files: deletedFiles, roomId })).match(
      noop,
      console.error,
    );
  };
  // The one place the current room may stand in for a captured room id, and only for the composer's own delete
  // Affordance: nothing awaits between that click and the write, so the two cannot disagree. Anything reached
  // Through a hook or a resolved send captures its room instead — the await is where they come apart.
  const discardCurrentUploadFiles = async (ids: string[]) => {
    const roomId = roomStore.currentRoomId;
    if (!roomId) return;

    await discardUploadFiles(roomId, ids);
  };
  // Keyed by the room the send was for AND by the ids that send persisted, like every other composer write here:
  // The hold and the commit both run behind the send, so by the time either fires the current room can already
  // Be a different one and the composer can already hold an attachment the user picked for their NEXT message.
  // Acting on everything the room holds now would take that one with it.
  // The attachments leave the composer at the bubble and are dropped for good only once the server accepts —
  // Removal is not a discard, since a persisted message now references those blobs, and the upload grants are
  // The only thing that can ever name them again. Dropped at the bubble, a send the server then rejects
  // (slowmode, the word filter) would leave the blobs referenced by no message and reclaimable by nothing, and
  // The user re-picking every attachment to try again
  MessageHookMap.ResetSend.register((roomId, fileIds) => {
    holdSendUploadFiles(roomId, fileIds);
  });
  MessageHookMap.CommitSend.register((roomId, fileIds) => {
    removeUploadFiles(roomId, fileIds);
  });
  MessageHookMap.RollbackSend.register((roomId, fileIds) => {
    releaseSendUploadFiles(roomId, fileIds);
  });
  return {
    discardCurrentUploadFiles,
    discardUploadFiles,
    files,
    fileUrlMap,
    isFileLoading,
    storeUploadEnd,
    storeUploadFileProgress,
    storeUploadFiles,
    storeUploadFileThumbnails,
    storeUploadStart,
  };
});
