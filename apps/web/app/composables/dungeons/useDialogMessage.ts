import { DialogMessage } from "#src/models/dungeons/UI/dialog/DialogMessage";

export const useDialogMessage = () => {
  const dialogMessage = ref(new DialogMessage());
  const textDisplayWidth = ref<number>();
  return { dialogMessage, textDisplayWidth };
};
