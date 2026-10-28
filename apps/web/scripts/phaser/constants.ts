import { ContentTypePhaserMethod } from "#shared/models/phaser/ContentTypePhaserMethod";
import { ROOT_DIRECTORY } from "@@/scripts/constants";

export const PHASER_ROOT_DIRECTORY = `${ROOT_DIRECTORY}/phaser`;

export const ContentTypePhaserMethodMap = {
  [ContentTypePhaserMethod.Audio]: "audio",
  [ContentTypePhaserMethod.Font]: "font",
  [ContentTypePhaserMethod.Image]: "image",
} as const;
