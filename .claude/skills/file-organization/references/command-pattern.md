# Command classes

Read when adding or editing a command in the undo/redo stack.

A command is a class extending `ADataSourceCommand<T extends CommandType>` declaring `readonly type = CommandType.X`. It never declares a `name` — the base exposes `get name() { return this.type; }`. The `CommandType` enum lives in `models/resource/sheet/commands/CommandType.ts`.

Field order inside the class, blank line between each group:

1. `readonly type`
2. `get description()`
3. every `readonly #` private field, grouped with no blank lines between them
4. the constructor
5. the methods, one blank line apart

Use ECMAScript `#` private members, never the TypeScript `private` keyword (`typescript` skill). Methods a subclass reaches — `doExecute`, `doUndo` — stay `protected`.

Commands live in a store `ref` array, so every instance is `markRaw`'d on entry: a reactive `Proxy` breaks `#` private brand checks at execute and undo time (`pinia` skill, "Storing Class Instances — markRaw").
