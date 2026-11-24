/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation on each exported
   constant, which the rule would strip */
import { describe } from "vitest";

// A hosted file as the suites name it: the origin it is served from, the scope its product keeps it under, the file's
// Name and the sha256 its url is keyed by. A changed file is the same name under the other sha256
export const TEST_ORIGIN: string = "http://a.test";
export const TEST_SHA256: string = "0".repeat(64);
export const TEST_CHANGED_SHA256: string = "1".repeat(64);
export const TEST_MODEL_URL: string = `${TEST_ORIGIN}/a/model.pmx?sha256=${TEST_SHA256}`;
export const TEST_TERMS_URL: string = `${TEST_ORIGIN}/a/terms.txt?sha256=${TEST_SHA256}`;
export const TEST_CHANGED_MODEL_URL: string = `${TEST_ORIGIN}/a/model.pmx?sha256=${TEST_CHANGED_SHA256}`;

describe.todo("constants");
