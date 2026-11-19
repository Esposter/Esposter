import { ControlsKey } from "#shared/models/dungeons/keys/image/UI/ControlsKey";
import base from "#src/assets/dungeons/UI/joystick/base.png";
import thumb from "#src/assets/dungeons/UI/joystick/thumb.png";

export const ControlsAssetMap = { [ControlsKey.Base]: base, [ControlsKey.Thumb]: thumb } as const satisfies Record<
  ControlsKey,
  string
>;
