import { ROOT_DIRECTORY } from "@@/scripts/constants";
import { ContentTypePhaserMethod } from "#shared/models/phaser/ContentTypePhaserMethod";

export const PHASER_ROOT_DIRECTORY = `${ROOT_DIRECTORY}/phaser`;

export const ContentTypePhaserMethodMap = {
  [ContentTypePhaserMethod.Audio]: "audio",
  [ContentTypePhaserMethod.Font]: "font",
  [ContentTypePhaserMethod.Image]: "image",
} as const;
