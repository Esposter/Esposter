import { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";

export class DialogTarget {
  id = crypto.randomUUID();
  message = ref(new DialogMessage());
  inputPromptCursorX: MaybeRef<number> = ref(0);

  constructor(init?: Partial<DialogTarget>) {
    Object.assign(this, init);
  }

  setMessage(message: DialogMessage) {
    this.message.value = message;
  }

  reset() {
    this.message.value = new DialogMessage();
  }
}
