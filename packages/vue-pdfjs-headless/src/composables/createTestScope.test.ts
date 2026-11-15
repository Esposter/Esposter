import type { EffectScope } from "vue";

import { describe, onTestFinished } from "vitest";
import { effectScope } from "vue";

// The scope stands in for the component the composable lives in, and stops when its test ends
// However the test ends, so a failing expect leaves no effect running into the next test
export const createTestScope = (): EffectScope => {
  const scope = effectScope();
  onTestFinished(() => {
    scope.stop();
  });

  return scope;
};

describe.todo("createTestScope");
