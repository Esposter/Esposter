# Adding a Game Object Component

Read when adding a game object component to the package, or writing its configuration interface or setter map.

## Configuration interfaces — `Pick` from game object types

When a configuration interface re-declares properties that exist on the Phaser game object, use `Pick<GameObjects.X, "prop1" | "prop2">` in `extends` instead of re-declaring each property individually:

```ts
export interface ArcConfiguration
  extends ShapeConfiguration, Pick<GameObjects.Arc, "closePath" | "endAngle" | "radius" | "startAngle"> {}
```

Keep explicit declarations only for `Parameters<GameObjects.X["method"]>` tuples and plain primitives (`number`, `string`) that are constructor args without a matching readable property.

## `SetterMap` setters return `void`

`SetterMap` types the inner setter function as returning `void`. When the setter body is a single method call that returns a value (Phaser fluent API), wrap it in braces — never use the `void` operator:

```ts
x: (gameObject) => (value) => { gameObject.setX(value); }, // wrap in braces; never the void operator
```

Multi-line setters already use braces naturally — no change needed.
