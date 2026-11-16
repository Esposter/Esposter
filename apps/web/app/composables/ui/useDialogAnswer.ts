import type { AwaitedReason } from "#src/models/shared/AwaitedReason";
import type { Promisable } from "type-fest";

// How a dialog that answers a write closes. Its write shows on screen before the server answers, so the dialog goes the
// Moment it is called and a refusal is left to the write's rollback and alert. A dialog that names a reason to wait is
// Awaited with its answer pending instead, closing once the write settles unless it settled `false`, which keeps the
// Dialog and its draft to try again
export const useDialogAnswer = (isOpen: Ref<boolean>) => {
  const { executeMutation, isPending } = useMutation();
  const key = Symbol("answer");
  const answer = async (write: () => Promisable<unknown>, awaitedBecause?: AwaitedReason) => {
    // A closed dialog has already answered: an optimistic answer closes it before the next press, so a double click
    // In the close transition is one answer rather than a second write
    if (!isOpen.value) return;
    if (!awaitedBecause) {
      // Called before the close, so a singleton dialog's handler reads its target before closing clears it
      const result = write();
      isOpen.value = false;
      await result;
      return;
    }

    await executeMutation(() => Promise.resolve(write()), {
      awaitedBecause,
      isExclusive: true,
      key,
      onSuccess: (result) => {
        if (result !== false) isOpen.value = false;
      },
    });
  };
  return { answer, isPending };
};
