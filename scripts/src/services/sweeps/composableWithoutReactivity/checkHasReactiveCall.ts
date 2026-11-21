// A reactive call, a lifecycle hook or a composable call anywhere in the source. The generic bracket is part of the
// Pattern: `useScript<typeof Desmos>(` is a composable call, and a pattern that ended at `(` would miss it.
const REACTIVE_CALL_REGEX =
  /\b(?:ref|shallowRef|computed|reactive|watch\w*|onMounted|onUnmounted|onScopeDispose|tryOnScopeDispose|use[A-Z]\w*)[<(]/u;

export const checkHasReactiveCall = (source: string): boolean => REACTIVE_CALL_REGEX.test(source);
