import type { ComposerTarget } from "@/models/message/ComposerTarget";
import type { UploadFileUrl } from "@/models/message/file/UploadFileUrl";
import type { FileEntity } from "@esposter/db-schema";

import { getComposerKey } from "@/services/message/composer/getComposerKey";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { getResultAsync, noop } from "@esposter/shared";

export const useUploadFileStore = defineStore("message/input/uploadFile", () => {
  const { $trpc } = useNuxtApp();
  // No slice here is ever the "current" one — every read and write below names the composer it is for, which is
  // The whole point of the partition, so these maps are keyed access only
  const NO_CURRENT_COMPOSER_KEY = "";
  // Partitioned by composer rather than by room: the thread pane composes its own reply beside the room's
  // Message, so an attachment picked in one must never appear in — or be sent by — the other. The blobs
  // Themselves stay a room's, which is why every server call below still takes `target.roomId`
  const { getData: getFiles, setData: setFiles } = useDataMap<FileEntity[]>(NO_CURRENT_COMPOSER_KEY, []);
  // The attachments a send has taken but the server has not answered for. Tracked as ids rather than moved out
  // Of the file list, because everything that makes a rejection recoverable — the upload grant, the preview url —
  // Hangs off the row, and removing the row destroys both
  const { getData: getSendingFileIds, setData: setSendingFileIds } = useDataMap(
    NO_CURRENT_COMPOSER_KEY,
    new Set<string>(),
  );
  const { getData: getFileUrlMap, setData: setFileUrlMap } = useDataMap(
    NO_CURRENT_COMPOSER_KEY,
    new Map<string, UploadFileUrl>(),
  );
  // The grant minted with each write target, kept for as long as the composer holds the file: it is the only
  // Thing that authorizes deleting an upload no message references yet, and the upload that received it returns
  // Long before the user decides which attachments to keep. Held here rather than in that closure is what lets
  // Every path that drops a file reclaim its blobs instead of only the one that failed mid-upload.
  const { getData: getUploadTokenMap, setData: setUploadTokenMap } = useDataMap(
    NO_CURRENT_COMPOSER_KEY,
    new Map<string, string>(),
  );
  // Counted per composer, never a single flag: a second drop lands while the first is still writing, and one
  // Boolean cleared by whichever batch finishes first re-enables Send while the other's blobs are still in
  // Flight — the send then names files the failing batch is about to delete. A count also keeps an upload in
  // One composer from gating the composer beside it.
  const { getData: getUploadingCount, setData: setUploadingCount } = useDataMap(NO_CURRENT_COMPOSER_KEY, 0);
  // The composer's own view, which is also the send's payload source and the delete affordance's list: an
  // Attachment in flight is in none of them, so the next Enter cannot post a second message naming its blob
  const getComposerFiles = (target: ComposerTarget) => {
    const key = getComposerKey(target);
    const sendingFileIds = getSendingFileIds(key) ?? new Set<string>();
    return (getFiles(key) ?? []).filter(({ id }) => !sendingFileIds.has(id));
  };
  const getComposerFileUrlMap = (target: ComposerTarget) =>
    getFileUrlMap(getComposerKey(target)) ?? new Map<string, UploadFileUrl>();
  const checkIsFileLoading = (target: ComposerTarget) => (getUploadingCount(getComposerKey(target)) ?? 0) > 0;
  const storeUploadStart = (target: ComposerTarget) => {
    const key = getComposerKey(target);
    setUploadingCount(key, (getUploadingCount(key) ?? 0) + 1);
  };
  const storeUploadEnd = (target: ComposerTarget) => {
    const key = getComposerKey(target);
    setUploadingCount(key, Math.max((getUploadingCount(key) ?? 0) - 1, 0));
  };
  // Every composer write is keyed by the composer the files were attached TO, never through a ref that resolves
  // To whichever composer is CURRENT the moment it is read: an upload awaits a SAS round trip and the blob PUTs
  // First. A user who switches rooms — or opens another thread — during that await would seed one composer's
  // Attachments into another's — sending there produces a message whose blobs live under the room they left, so
  // Every attachment renders permanently broken — and the matching revert would find nothing to take back out,
  // Stranding the composer it exists to clean up.
  const storeUploadFiles = (target: ComposerTarget, uploadFiles: { file: File; id: string; token: string }[]) => {
    const key = getComposerKey(target);
    const composerFiles = getFiles(key) ?? [];
    const composerFileUrlMap = getFileUrlMap(key) ?? new Map<string, UploadFileUrl>();
    const composerUploadTokenMap = getUploadTokenMap(key) ?? new Map<string, string>();
    for (const { file, id, token } of uploadFiles) {
      composerFiles.push({ filename: file.name, hasThumbnail: false, id, mimetype: file.type, size: file.size });
      composerFileUrlMap.set(id, reactive<UploadFileUrl>({ progress: 0, url: URL.createObjectURL(file) }));
      composerUploadTokenMap.set(id, token);
    }

    setFiles(key, composerFiles);
    setFileUrlMap(key, composerFileUrlMap);
    setUploadTokenMap(key, composerUploadTokenMap);
  };
  const storeUploadFileProgress = (target: ComposerTarget, id: string, progress: number) => {
    const uploadFileUrl = getFileUrlMap(getComposerKey(target))?.get(id);
    if (uploadFileUrl) uploadFileUrl.progress = progress;
  };
  // Recorded by the only thing that knows it — the upload that wrote the thumbnail blob. The renderer would
  // Otherwise have to infer a missing thumbnail from a failed image load, which is the same signal an expired
  // Read SAS gives it.
  const storeUploadFileThumbnails = (target: ComposerTarget, ids: string[]) => {
    const key = getComposerKey(target);
    const composerFiles = getFiles(key);
    if (!composerFiles) return;

    const idSet = new Set(ids);
    for (const file of composerFiles) if (idSet.has(file.id)) file.hasThumbnail = true;
    setFiles(key, composerFiles);
  };
  // Holds the attachments a send took: they stay in the store with their grants, out of the composer, until the
  // Server answers one way or the other
  const holdSendUploadFiles = (target: ComposerTarget, ids: string[]) => {
    const key = getComposerKey(target);
    const composerSendingFileIds = getSendingFileIds(key) ?? new Set<string>();
    for (const id of ids) composerSendingFileIds.add(id);
    setSendingFileIds(key, composerSendingFileIds);
  };
  // Hands held attachments back to the composer, grants and previews intact
  const releaseSendUploadFiles = (target: ComposerTarget, ids: string[]) => {
    const composerSendingFileIds = getSendingFileIds(getComposerKey(target));
    if (!composerSendingFileIds) return;

    for (const id of ids) composerSendingFileIds.delete(id);
    setSendingFileIds(getComposerKey(target), composerSendingFileIds);
  };
  // Takes files out of the composer and nothing more — for the send, whose blobs are now referenced by a
  // Persisted message. Returns what it took out, because a discard has to name those files to reclaim them.
  const removeUploadFiles = (target: ComposerTarget, ids: string[]): FileEntity[] => {
    const key = getComposerKey(target);
    const idSet = new Set(ids);
    const composerFileUrlMap = getFileUrlMap(key);
    const composerUploadTokenMap = getUploadTokenMap(key);
    for (const id of ids) {
      const uploadFileUrl = composerFileUrlMap?.get(id);
      if (uploadFileUrl) {
        URL.revokeObjectURL(uploadFileUrl.url);
        composerFileUrlMap?.delete(id);
      }

      composerUploadTokenMap?.delete(id);
    }

    const composerFiles = getFiles(key) ?? [];
    const removedFiles = composerFiles.filter(({ id }) => idSet.has(id));
    setFiles(
      key,
      composerFiles.filter(({ id }) => !idSet.has(id)),
    );
    // Whatever brought the row here, it is gone — so the hold that was keeping it out of the composer goes with
    // It, rather than accumulating an id for a row nothing can name again
    releaseSendUploadFiles(target, ids);
    return removedFiles;
  };
  // The one way an attachment leaves the composer WITHOUT being sent, and therefore the one place its blobs are
  // Reclaimed: the composer's delete affordance and a failed upload's revert are the same act. Nothing else can
  // Ever name these blobs again — no message references them, so a row dropped without this leaves the original
  // And its thumbnail billed until the whole room is deleted.
  // Best-effort: the composer is already consistent without the server call, and a failure costs storage rather
  // Than correctness, so it never interrupts whatever the user is doing.
  const discardUploadFiles = async (target: ComposerTarget, ids: string[]) => {
    const composerUploadTokenMap = getUploadTokenMap(getComposerKey(target));
    // Read before the removal takes the tokens with it
    const tokens = new Map<string, string>(
      ids.flatMap((id) => {
        const token = composerUploadTokenMap?.get(id);
        return token ? [[id, token] as const] : [];
      }),
    );
    const removedFiles = removeUploadFiles(target, ids);
    const deletedFiles = removedFiles.flatMap(({ filename, id }) => {
      const token = tokens.get(id);
      return token ? [{ filename, id, token }] : [];
    });
    if (deletedFiles.length === 0) return;
    // The blobs are the room's wherever they were attached, so the write names the room rather than the composer
    await getResultAsync(() =>
      $trpc.message.deleteUploadFiles.mutate({ files: deletedFiles, roomId: target.roomId }),
    ).match(noop, console.error);
  };
  // Keyed by the composer the send was for AND by the ids that send persisted, like every other write here: the
  // Hold and the commit both run behind the send, so by the time either fires the composer can already hold an
  // Attachment the user picked for their NEXT message. Acting on everything it holds now would take that one
  // With it.
  // The attachments leave the composer at the bubble and are dropped for good only once the server accepts —
  // Removal is not a discard, since a persisted message now references those blobs, and the upload grants are
  // The only thing that can ever name them again. Dropped at the bubble, a send the server then rejects
  // (slowmode, the word filter) would leave the blobs referenced by no message and reclaimable by nothing, and
  // The user re-picking every attachment to try again
  MessageHookMap.ResetSend.register((target, fileIds) => {
    holdSendUploadFiles(target, fileIds);
  });
  MessageHookMap.CommitSend.register((target, fileIds) => {
    removeUploadFiles(target, fileIds);
  });
  MessageHookMap.RollbackSend.register((target, fileIds) => {
    releaseSendUploadFiles(target, fileIds);
  });
  return {
    checkIsFileLoading,
    discardUploadFiles,
    getComposerFiles,
    getComposerFileUrlMap,
    storeUploadEnd,
    storeUploadFileProgress,
    storeUploadFiles,
    storeUploadFileThumbnails,
    storeUploadStart,
  };
});
