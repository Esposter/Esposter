---
title: Specular ramp
description: A second toon ramp giving wet stone and metal a hard band of highlight, as the game's specular reads — deferred until a region has either.
---

# Specular ramp

The rendering style's proposal gave the environment material a second ramp beside the diffuse one: a narrow band of highlight where the half-vector meets the normal, stepped the way the diffuse light is, for wet stone after rain and for metal fittings.

**Why deferred:** Windrise has neither. Its stone is a dry, matte statue, and nothing else in the valley shines, so a specular term would cost every environment fragment for no pixel that shows it.

**Revisit when:** a region's landmarks include metal or wet stone, which the first Liyue or Fontaine build does, or the weather page makes rain wet the ground.
