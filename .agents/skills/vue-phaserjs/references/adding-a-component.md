# Adding a Game Object Component

Read when adding a game object component to the package, or writing its configuration interface or setter map.

## Configuration interfaces — `Pick` from game object types

A configuration interface `Pick`s what the Phaser game object already declares rather than re-declaring it — the rule and the declarations it leaves explicit are the `typescript` skill's (`references/type-modelling.md`). Here it reads:

```ts
export interface ArcConfiguration
  extends ShapeConfiguration, Pick<GameObjects.Arc, "closePath" | "endAngle" | "radius" | "startAngle"> {}
```

## `SetterMap` setters return `void`

`SetterMap` types the inner setter function as returning `void`. When the setter body is a single method call that returns a value (Phaser fluent API), wrap it in braces — never use the `void` operator:

```ts
x: (gameObject) => (value) => { gameObject.setX(value); }, // wrap in braces; never the void operator
```

Multi-line setters already use braces naturally — no change needed.
