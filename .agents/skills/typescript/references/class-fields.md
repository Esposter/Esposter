# Class Fields — `declare` over `!`

Read when adding a field to a class.

For a class field with **no inline initializer** (value provided by `Object.assign(this, init)`, a parent/mixin constructor, external assignment, or a pure phantom type carrier), use `declare`, **never** `!`.

**Why**: `declare` emits no field declaration, avoiding the `useDefineForClassFields` footgun where an emitted `field = undefined` runs after `super()` and clobbers a value set by a parent/mixin. `!` only suppresses the strict-init error while still emitting the clobbering initializer.

- Applies to all fields lacking an inline initializer: phantom type carriers, `Object.assign`-populated entity models (`AzureEntity`/`CompositeKeyEntity`/`*MessageEntity`), externally-assigned fields.
- **Keep the inline initializer** for fields that have one (`id: string = crypto.randomUUID()`) — never convert to `declare` (that drops the runtime default); they're mutually exclusive.
- Optional fields (`direction?: Direction`) are already correct — leave them.
