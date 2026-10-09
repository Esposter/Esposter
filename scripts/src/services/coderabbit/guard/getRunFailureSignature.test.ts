import { CI_FAILURE_CONCLUSION, CI_SUCCESS_CONCLUSION } from "#src/services/coderabbit/collect/constants";
import { getFailureSignature } from "#src/services/coderabbit/collect/getFailureSignature";
import { FAILURE_ANNOTATION_LEVEL } from "#src/services/coderabbit/guard/constants";
import { getRunFailureSignature } from "#src/services/coderabbit/guard/getRunFailureSignature";
import { describe, expect, test } from "vitest";

describe(getRunFailureSignature, () => {
  // The runner's exit code is the same line for every red, so a key on it would read any three reds of one step as one
  // Red repeated: the collector's own line is the one that tells them apart, wherever the runner's sorts
  test("keys a red on its failed step and the earliest error line of its own", () => {
    expect.hasAssertions();

    const job = {
      conclusion: CI_FAILURE_CONCLUSION,
      databaseId: 0,
      name: "",
      steps: [
        { conclusion: CI_SUCCESS_CONCLUSION, name: "a" },
        { conclusion: CI_FAILURE_CONCLUSION, name: "b" },
      ],
    };
    const annotations = [
      { annotation_level: FAILURE_ANNOTATION_LEVEL, message: "Process completed with exit code 1.", start_line: 0 },
      { annotation_level: "notice", message: "notice", start_line: 0 },
      { annotation_level: FAILURE_ANNOTATION_LEVEL, message: "b", start_line: 2 },
      { annotation_level: FAILURE_ANNOTATION_LEVEL, message: "a", start_line: 1 },
    ];

    expect(getRunFailureSignature(job, annotations)).toStrictEqual(getFailureSignature("b", ["a"]));
  });
});
