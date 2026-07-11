---
title: Real fluid dynamics
description: Replacing the ocean shader with an actual particle or grid fluid simulation.
---

# Real Fluid Dynamics

An actual fluid simulation (SPH particles or a grid solver) running in WebGPU compute, instead of the three.js ocean shader.

**Why not:** A compute-shader fluid solver is a serious graphics project whose payoff is a prettier demo page — no user-facing product depends on it. The page's purpose (exercising the WebGPU render pipeline and inspector integration) is already met. Revisit only if a real product feature ever needs GPU compute, in which case it would be its own effort, not an upgrade to this page.
