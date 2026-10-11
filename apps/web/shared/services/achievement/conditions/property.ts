import type { Get, Paths } from "type-fest";

import { getPropertyValue } from "#shared/services/achievement/conditions/getPropertyValue";

// A predicate over one path of the input, typed by the input's own value at that path. The input type comes from the
// Definition that receives the predicate, so the test's parameter is not an inference site for it
export const property =
  <TInput, TPath extends Paths<TInput> & string>(path: TPath, test: (value: NoInfer<Get<TInput, TPath>>) => boolean) =>
  (input: TInput): boolean =>
    test(getPropertyValue(input, path));
