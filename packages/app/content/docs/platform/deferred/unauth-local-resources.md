---
title: Unauthenticated local resources
description: Deferred — editing resources without an account via a localStorage persistence path.
---

# Unauthenticated local resources

Editing resources without an account via a localStorage persistence path (the pre-consolidation table editor worked logged-out).

## Why deferred

Two persistence mechanisms (blob + localStorage) double every save/load path in `useResource` for a niche flow. The consolidation keeps exactly one mechanism; `/resources` is auth-gated.

## Revisit when

Anonymous trial-before-login becomes an explicit product goal — then design it deliberately (e.g. a demo resource seeded on signup, or a scoped localStorage draft that imports on login) rather than a parallel save path.
