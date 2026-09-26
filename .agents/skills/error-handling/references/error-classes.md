# Error Classes

Read when writing or deduplicating an error class.

- **Each error class writes `this.name = "ItsOwnName"` as a literal, and that repetition stays.** A base doing `this.name = new.target.name` would read as the obvious dedupe, but class names are mangled by the minifier, so every client-side error would report a one-letter name. The classes are matched with `instanceof` — the name is only ever displayed — which is exactly why a degraded one would go unnoticed. Each class still needs its own constructor to build its message, so the base saves one line and costs that.
