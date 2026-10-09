import { getVoiceDeviceLadder } from "#src/services/getVoiceDeviceLadder";
import { describe, expect, test } from "vitest";

describe(getVoiceDeviceLadder, () => {
  // The devices each platform's transformers.js 4.3.1 build offers, read from its backends/onnx.js: `dml` on Windows,
  // `coreml` on macOS, `cuda` on x64 Linux, and `webgpu` and `cpu` on every Node platform
  const supportedDevicesByPlatform: [NodeJS.Platform, string[]][] = [
    ["darwin", ["coreml", "webgpu", "cpu"]],
    ["linux", ["cuda", "webgpu", "cpu"]],
    ["win32", ["dml", "webgpu", "cpu"]],
  ];

  test.each(supportedDevicesByPlatform)("names only the devices the %s build offers", (platform, supportedDevices) => {
    expect.hasAssertions();

    const devices = getVoiceDeviceLadder(platform).flatMap((rung) => Object.values(rung.devices));

    expect(devices.filter((device) => !supportedDevices.includes(device))).toStrictEqual([]);
  });

  test("keeps the Windows rungs as they were, since their names are kept on disk", () => {
    expect.hasAssertions();

    expect(getVoiceDeviceLadder("win32")).toStrictEqual([
      {
        devices: {
          conditional_decoder: "dml",
          embed_tokens: "webgpu",
          language_model: "webgpu",
          model: "webgpu",
          speech_encoder: "cpu",
        },
        name: "webgpu-language-model-dml-vocoder",
      },
      {
        devices: {
          conditional_decoder: "cpu",
          embed_tokens: "webgpu",
          language_model: "webgpu",
          model: "webgpu",
          speech_encoder: "cpu",
        },
        name: "webgpu-language-model",
      },
      {
        devices: {
          conditional_decoder: "cpu",
          embed_tokens: "cpu",
          language_model: "cpu",
          model: "cpu",
          speech_encoder: "cpu",
        },
        name: "cpu",
      },
    ]);
  });

  test("gives a platform with no ladder of its own the CPU alone", () => {
    expect.hasAssertions();

    expect(getVoiceDeviceLadder("freebsd")).toStrictEqual([
      {
        devices: {
          conditional_decoder: "cpu",
          embed_tokens: "cpu",
          language_model: "cpu",
          model: "cpu",
          speech_encoder: "cpu",
        },
        name: "cpu",
      },
    ]);
  });
});
