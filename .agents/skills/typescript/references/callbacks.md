# Callbacks

Read when handing a function to an array method, a lifecycle hook or an event listener. The one-line rule is in `SKILL.md`; this page is why, and the exceptions.

- **Array methods** — `no-restricted-syntax` (`packages/configuration/eslint/restrictedSyntaxes.js`) reports a bare reference passed as an array method's callback, and its selector is the list of methods. Wrap it: `array.map((item) => fn(item))`, `array.reduce((accumulator, item) => fn(accumulator, item), 0)`. A bare reference forwards every argument the method supplies (`.map` passes the index, `.reduce` the accumulator), and a method reference loses `this` binding.
- **Lifecycle hooks** — wrap them: `onUnmounted(() => { reset(); })`.
- **Event listeners** — a listener is passed by reference when it must be removed later, because `removeEventListener` matches the very reference `addEventListener` received; a listener nothing removes is wrapped like a hook.
- **The exception** — `Number`, `String` and `Boolean` are passed bare, and the array-method enforcer above excepts them. `unicorn/prefer-native-coercion-functions` demands the bare reference: each reads one argument and ignores the index, so the wrapper only hides which of the three is being called.
