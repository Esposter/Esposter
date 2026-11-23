import { FileKey } from "#shared/generated/phaser/FileKey";
import base from "#src/assets/dungeons/UI/joystick/base.png";
import thumb from "#src/assets/dungeons/UI/joystick/thumb.png";

export const ControlsAssetMap = {
  [FileKey.UIJoystickBase]: base,
  [FileKey.UIJoystickThumb]: thumb,
} as const satisfies Partial<Record<FileKey, string>>;
