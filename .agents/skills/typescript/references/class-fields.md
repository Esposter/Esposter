# Class Fields — `declare` over `!`, and construction

Read when adding a field to a class, or building an instance of one.

For a class field with **no inline initializer** (value provided by `Object.assign(this, init)`, a parent/mixin constructor, external assignment, or a pure phantom type carrier), use `declare`, **never** `!`.

**Why**: `declare` emits no field declaration, avoiding the `useDefineForClassFields` footgun where an emitted `field = undefined` runs after `super()` and clobbers a value set by a parent/mixin. `!` only suppresses the strict-init error while still emitting the clobbering initializer.

- Applies to all fields lacking an inline initializer: phantom type carriers, `Object.assign`-populated models (`FileEntity`), externally-assigned fields.
- **Keep the inline initializer** for fields that have one (`createdAt: Date = new Date()`) — never convert to `declare` (that drops the runtime default); they're mutually exclusive.
- Optional fields (`direction?: Direction`) are already correct — leave them.

## Construction

A class of our own is built by its constructor, never an object literal of its shape, so its inline defaults are set: `new DialogMessage({ text })`, not `{ text }`. `typescript/no-unsafe-class-instance-assignment` reports the literal. It is off in tests and fixtures, where a double stands in for a class instance by design. Two sites keep a directive: an argument to a Durable Object RPC, since Workers RPC serializes a plain object and refuses an instance of a class of our own, and a three.js node, since `@types/three` declares each node class on a base whose instance is an intersection, which the rule does not read as a subclass (typescript-eslint/typescript-eslint#13214, closed as not planned).
