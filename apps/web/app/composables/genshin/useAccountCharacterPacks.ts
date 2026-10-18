import type { AccountCharacterPackRecord } from "#server/models/genshin/AccountCharacterPackRecord";
import type { MutationOutcome } from "@/models/shared/MutationOutcome";
import type { CharacterPack } from "genshin-world";

import { MutationStatus } from "@/models/shared/MutationStatus";
import { authClient } from "@/services/auth/authClient";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { getSha256Hex } from "@/services/shared/getSha256Hex";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { watchImmediate } from "@vueuse/core";

// A write's result, or the reason it did not land: its own error where it failed, else that it was dropped or superseded
const takeMutationResult = <TResult>(outcome: MutationOutcome<TResult>): TResult => {
  if (outcome.status === MutationStatus.Succeeded) return outcome.result;
  if (outcome.status === MutationStatus.Failed) throw outcome.error;
  throw new InvalidOperationError(Operation.Create, "character pack", "was not kept, as its request was dropped");
};

// The packs the player's account keeps, read while the player is signed in, and kept or removed on it. A kept pack's files
// Are each uploaded to a staging name of their own first, and the account names the pack only once every one of them has landed
export const useAccountCharacterPacks = () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const session = authClient.useSession();
  const isSignedIn = computed(() => Boolean(session.value.data));
  const { data, refresh } = useQuery(() => $trpc.genshin.readCharacterPacks.query(), { isLazy: true });
  // oxlint-disable-next-line typescript/no-floating-promises -- the refresh reports its own failure through its query's error
  watchImmediate(isSignedIn, (signedIn) => (signedIn ? refresh() : undefined));
  const accountCharacterPacks = computed<AccountCharacterPackRecord[] | undefined>(() =>
    isSignedIn.value ? data.value : undefined,
  );
  const keepAccountCharacterPack = async ({ characterId, files, modelName, packHash }: CharacterPack) => {
    const uploadedFiles = await Promise.all(
      Array.from(files, async ([path, blob]) => ({
        blob,
        path,
        sha256: await getSha256Hex(await blob.bytes()),
        size: blob.size,
      })),
    );
    const grants = takeMutationResult(
      await executeMutation(
        () =>
          $trpc.genshin.generateCharacterPackUploadSasUrls.mutate({
            files: uploadedFiles.map(({ size }) => ({ size })),
          }),
        { key: "generateCharacterPackUploadSasUrls" },
      ),
    );
    await Promise.all(uploadedFiles.map(({ blob }, index) => uploadBlocks(blob, takeOne(grants, index).sasUrl)));
    takeMutationResult(
      await executeMutation(
        () =>
          $trpc.genshin.keepCharacterPack.mutate({
            characterId,
            files: uploadedFiles.map(({ path, sha256, size }, index) => ({
              path,
              sha256,
              size,
              stagingId: takeOne(grants, index).stagingId,
            })),
            modelName,
            packHash,
          }),
        { key: "keepCharacterPack" },
      ),
    );
    await refresh();
  };
  const removeAccountCharacterPack = async (characterId: number) => {
    takeMutationResult(
      await executeMutation(() => $trpc.genshin.removeCharacterPack.mutate({ characterId }), {
        key: "removeCharacterPack",
      }),
    );
    await refresh();
  };
  return { accountCharacterPacks, isSignedIn, keepAccountCharacterPack, removeAccountCharacterPack };
};
