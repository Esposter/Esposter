import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

export abstract class BaseControls {
  input: PlayerInput | null = null;

  getInput() {
    const cameraStore = useCameraStore();
    const { isFading } = storeToRefs(cameraStore);
    if (isFading.value) return -1;
    const input = this.input;
    this.resetInput();
    return input;
  }

  setInput(input: PlayerInput) {
    const cameraStore = useCameraStore();
    const { isFading } = storeToRefs(cameraStore);
    if (isFading.value) return;
    this.input = input;
  }

  resetInput() {
    this.input = null;
  }
}
