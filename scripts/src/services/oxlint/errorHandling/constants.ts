export const MESSAGE =
  "`new Error(…)` carries no operation and no entity — throw `InvalidOperationError` (or the tRPC error constructor the route rejects with). See the error-handling skill.";
export const UNCOMMENTED_FALLBACK_MESSAGE =
  "A failure that becomes `undefined`, `null`, `false` or an empty value is read as \"there was nothing\" — log it with `.orTee(console.error)` or the err arm's `console.error`, or name in a comment beside it why the failure is the expected answer. See the error-handling skill's logging-sinks page.";
export const UNFINALIZED_RESOURCE_MESSAGE =
  "A resource bound by an `await` is released by this finalizer only after another `await` has run: a rejection in between leaves it open. Wrap the rest of its use in the finalizer, so nothing is awaited before the finalizer is set. See the error-handling skill's finalizers page.";
