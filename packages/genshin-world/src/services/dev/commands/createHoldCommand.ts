import type { DevCommand } from "#src/models/dev/DevCommand";

import { dispatchHoldCodes } from "#src/services/dev/dispatchHoldCodes";
import { resolveHoldCodes } from "#src/services/dev/resolveHoldCodes";
import { updateHoldCounts } from "#src/services/dev/updateHoldCounts";
import { z } from "zod";

const holdArgs = z.object({ control: z.string(), seconds: z.coerce.number().min(0).default(0) });

// `hold <control> <seconds>` presses a move direction's key or an input action's default binding for the seconds given,
// and a zero presses it once. The codes go out as the window's events and are let go on the frame clock, so the seconds
// are the frames' time. A gamepad button is read as held only from a pad, so a hold of one lasts a single read
export const createHoldCommand = ({
  onFrame,
  target,
}: {
  onFrame: (listener: (deltaSeconds: number) => void) => void;
  target: Pick<Window, "dispatchEvent">;
}): DevCommand<typeof holdArgs> => {
  // The holds still down, each with the seconds left before its codes are let go
  const pendingHolds = new Set<{ codes: readonly string[]; remainingSeconds: number }>();
  // How many holds press each code, so a code is let go only when the last of them ends
  const codeHoldCountMap = new Map<string, number>();
  const setHoldCodes = ({ codes, isPressed }: { codes: readonly string[]; isPressed: boolean }) => {
    dispatchHoldCodes(target, { codes: updateHoldCounts(codeHoldCountMap, { codes, isPressed }), isPressed });
  };
  onFrame((deltaSeconds) => {
    for (const pendingHold of pendingHolds) {
      pendingHold.remainingSeconds -= deltaSeconds;
      if (pendingHold.remainingSeconds <= 0) {
        pendingHolds.delete(pendingHold);
        setHoldCodes({ codes: pendingHold.codes, isPressed: false });
      }
    }
  });

  return {
    args: holdArgs,
    argumentNames: ["control", "seconds"],
    name: "hold",
    run: ({ control, seconds }) => {
      const codes = resolveHoldCodes(control);
      if (codes === undefined) return { error: `unknown control ${control}`, ok: false };

      setHoldCodes({ codes, isPressed: true });
      if (seconds === 0) setHoldCodes({ codes, isPressed: false });
      else pendingHolds.add({ codes, remainingSeconds: seconds });
      return { ok: true, value: seconds };
    },
  };
};
