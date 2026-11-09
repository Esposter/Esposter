# Countdown Motion

Reduced-motion handling for the webpage's animated blocks, applied to the countdown. It covers the webpage row "Reduced motion respected by animated blocks". The typed-text block already honours the reader's reduced-motion preference, and the countdown has no rule of its own.

## Why deferred

The countdown rewrites its numerals once a second, in a script the published page runs (`apps/web/shared/services/pageBuilder/countdownNodeType.ts`, described in the [document model](../../../specs/resource/page-builder/document-model/design.md)). The typed-text block honours reduced motion because it animates. A numeral that changes each second is not an animation, so the preference has nothing for the countdown to stop today.

**Revisit when:** a motion effect is added to the countdown, and its reduced-motion rule is designed with it.
