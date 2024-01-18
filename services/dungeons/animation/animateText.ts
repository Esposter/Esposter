import { dayjs } from "@/services/dayjs";
import { type GameObjects, type Scene } from "phaser";

export const animateText = (
  scene: Scene,
  target: GameObjects.Text,
  text: string,
  configuration?: {
    delay?: number;
    onComplete?: () => void;
  },
) => {
  let i = 0;
  scene.time.addEvent({
    delay: configuration?.delay ?? dayjs.duration(25, "milliseconds").asMilliseconds(),
    repeat: text.length - 1,
    callback: () => {
      target.text += text[i];
      i++;
      if (i === text.length - 1) configuration?.onComplete?.();
    },
  });
};
