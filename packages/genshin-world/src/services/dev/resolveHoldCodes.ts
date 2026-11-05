import { DevMoveDirection, DevMoveDirections } from "#src/models/dev/DevMoveDirection";
import { takeOne } from "@esposter/shared";
import {
  InputActionBindingMap,
  InputActions,
  KEY_CODE_BACKWARD,
  KEY_CODE_DOWN,
  KEY_CODE_FORWARD,
  KEY_CODE_LEFT,
  KEY_CODE_RIGHT,
  KEY_CODE_UP,
} from "genshin-engine";

// The key the input reads each move direction from, the same keys the free camera reads
const DevMoveDirectionKeyCodeMap = {
  [DevMoveDirection.Backward]: KEY_CODE_BACKWARD,
  [DevMoveDirection.Down]: KEY_CODE_DOWN,
  [DevMoveDirection.Forward]: KEY_CODE_FORWARD,
  [DevMoveDirection.Left]: KEY_CODE_LEFT,
  [DevMoveDirection.Right]: KEY_CODE_RIGHT,
  [DevMoveDirection.Up]: KEY_CODE_UP,
} as const satisfies Readonly<Record<DevMoveDirection, string>>;

// The codes a control names holds: a move direction's key, or an input action's first chord, which is its default binding.
// A control that is neither answers nothing
export const resolveHoldCodes = (control: string) => {
  const direction = DevMoveDirections.find((devMoveDirection) => devMoveDirection === control);
  if (direction !== undefined) return [DevMoveDirectionKeyCodeMap[direction]];

  const action = InputActions.find((inputAction) => inputAction === control);
  if (action === undefined) return undefined;

  return takeOne(InputActionBindingMap[action], 0);
};
