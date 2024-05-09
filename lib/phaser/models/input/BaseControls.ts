import { useInputStore } from "@/lib/phaser/store/input";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

export abstract class BaseControls {
  input: PlayerInput | null = null;

  getInput() {
    const inputStore = useInputStore();
    const { isActive } = storeToRefs(inputStore);
    if (!isActive.value) return -1;
    const input = this.input;
    this.resetInput();
    return input;
  }

  setInput(input: PlayerInput) {
    const inputStore = useInputStore();
    const { isActive } = storeToRefs(inputStore);
    if (!isActive.value) return;
    this.input = input;
  }

  resetInput() {
    this.input = null;
  }
}
