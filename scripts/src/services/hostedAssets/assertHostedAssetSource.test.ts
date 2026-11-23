import { assertHostedAssetSource } from "#src/services/hostedAssets/assertHostedAssetSource";
import { HOSTED_OBJECT_MAX_BYTES } from "#src/services/hostedAssets/constants";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { describe, expect, test } from "vitest";

describe(assertHostedAssetSource, () => {
  const folder = TEST_FILENAME;

  test("a WAV file is refused", () => {
    expect.hasAssertions();

    expect(() => {
      assertHostedAssetSource({ bytes: 1, path: `${folder}/${TEST_FILENAME}.wav` });
    }).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/a.wav, is lossless or uncompressed audio, which is published as MP3 or Ogg instead]`,
    );
  });

  test("a file over the cap is refused", () => {
    expect.hasAssertions();

    expect(() => {
      assertHostedAssetSource({ bytes: HOSTED_OBJECT_MAX_BYTES + 1, path: `${folder}/${TEST_FILENAME}.png` });
    }).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/a.png, is over the 16777216 byte cap]`,
    );
  });

  test("a file whose extension has no content type is refused", () => {
    expect.hasAssertions();

    expect(() => {
      assertHostedAssetSource({ bytes: 1, path: `${folder}/${TEST_FILENAME}.gif` });
    }).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/a.gif, has an extension with no content type]`,
    );
  });

  test("a file inside the declared folder with a content type is accepted", () => {
    expect.hasAssertions();

    expect(() => {
      assertHostedAssetSource({ bytes: 1, path: `${folder}/${TEST_FILENAME}.png` });
    }).not.toThrow();
  });
});
