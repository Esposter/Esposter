# Generic cross-product event bus

A new platform-wide event bus (topic registry, product subscribers) for cross-product reactions.

## Why not

The tRPC mutation path already _is_ the event taxonomy — `achievementPlugin` proves it: any product mutation is addressable by path string with zero registration. A second bus would duplicate that with infrastructure (topics, delivery, replay) that had no consumer beyond achievements. A second consumer has since appeared, the moderation log, and it took the existing middleware pattern as this record says to, so the bus is still not needed.
