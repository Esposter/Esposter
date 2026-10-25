import type { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";

export const getDialogTargetText = (target: DialogTarget) =>
  computed({
    get: () => target.message.value.text,
    set: (newText) => {
      target.message.value.text = newText;
    },
  });
