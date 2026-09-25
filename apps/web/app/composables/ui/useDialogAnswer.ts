import type { Promisable } from "type-fest";

// How a dialog that answers a write closes: an optimistic write shows on screen before the server answers, so the
// Dialog goes the moment it is called and a rejection is left to its rollback and toast. Any other is awaited with the
// Answer pending, closing once it settles unless it settled `false`, which keeps the dialog and its draft to try again
export const useDialogAnswer = (isOpen: Ref<boolean>) => {
  const { executeMutation, isPending } = useMutation();
  const key = Symbol("answer");
  const answer = async (write: () => Promisable<unknown>, isOptimistic?: true) => {
    if (isOptimistic) {
      // Called before the close, so a singleton dialog's handler reads its target before closing clears it
      const result = write();
      isOpen.value = false;
      await result;
      return;
    }

    await executeMutation(() => Promise.resolve(write()), {
      isExclusive: true,
      key,
      onSuccess: (result) => {
        if (result !== false) isOpen.value = false;
      },
    });
  };
  return { answer, isPending };
};
