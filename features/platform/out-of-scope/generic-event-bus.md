# Generic Cross-Product Event Bus

A new platform-wide event bus (topic registry, product subscribers) for cross-product reactions.

## Why not

The tRPC mutation path already _is_ the event taxonomy — `achievementPlugin` proves it: any product mutation is addressable by path string with zero registration. A second bus would duplicate that with infrastructure (topics, delivery, replay) that has no consumer beyond achievements today. If a real second consumer appears, extend the existing middleware pattern rather than building a bus.
