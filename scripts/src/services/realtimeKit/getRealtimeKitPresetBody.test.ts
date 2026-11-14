import { getRealtimeKitPresetBody } from "#src/services/realtimeKit/getRealtimeKitPresetBody";
import { describe, expect, test } from "vitest";

describe(getRealtimeKitPresetBody, () => {
  test.each([
    [false, false, "NOT_ALLOWED", "NOT_ALLOWED"],
    [true, false, "ALLOWED", "NOT_ALLOWED"],
    [true, true, "ALLOWED", "ALLOWED"],
    [false, true, "NOT_ALLOWED", "ALLOWED"],
  ])(
    "publishes microphone as allowed by %s and screenshare as allowed by %s, with camera always allowed",
    (isMicrophoneAllowed, isScreenshareAllowed, audioCanProduce, screenshareCanProduce) => {
      expect.hasAssertions();

      expect(
        getRealtimeKitPresetBody({ isMicrophoneAllowed, isScreenshareAllowed, name: "" }).permissions.media,
      ).toStrictEqual({
        audio: { can_produce: audioCanProduce },
        screenshare: { can_produce: screenshareCanProduce },
        video: { can_produce: "ALLOWED" },
      });
    },
  );
});
