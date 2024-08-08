import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { useInputStore } from "@/lib/phaser/store/input";

export abstract class BaseControls {
  input: null | PlayerInput = null;

  getInput() {
    const inputStore = useInputStore();
    const { isInputActive } = storeToRefs(inputStore);
    if (!isInputActive.value) return -1;
    const input = this.input;
    this.resetInput();
    return input;
  }

  resetInput() {
    this.input = null;
  }

  setInput(input: PlayerInput) {
    const inputStore = useInputStore();
    const { isInputActive } = storeToRefs(inputStore);
    if (!isInputActive.value) return;
    this.input = input;
  }
}
