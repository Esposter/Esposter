# Callbacks

Read when handing a function to an array method, a lifecycle hook or an event listener. The one-line rule is in `SKILL.md`; this page is why, and the one exception.

- **Never pass a function reference as a callback** — wrap it: `array.map((item) => fn(item))`, `onUnmounted(() => { reset(); })`. A bare reference forwards every argument the caller supplies (`.map` passes the index) and loses `this` binding on a method. Applies to array methods, lifecycle hooks and event listeners alike — except for the native coercion functions, where `unicorn/prefer-native-coercion-functions` demands the bare reference and is right to: `Number`, `String` and `Boolean` each read one argument and ignore the index, so the wrapper only hides which of the three is being called.
