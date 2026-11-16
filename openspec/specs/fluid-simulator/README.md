# Fluid Simulator

The fluid simulator at `/fluid-simulator` is a self-contained real-time ocean scene rendered with Three.js's WebGPU renderer: an infinite `WaterMesh` plane with normal-map distortion, a procedural `SkyMesh` (sun position, clouds), a bloom post-processing pass, and a reflective box bobbing on the waves. Orbit controls move the camera; Three.js's Inspector exposes live sliders for sky (elevation, azimuth, exposure), water (distortion, size), bloom (strength, radius), and clouds (coverage, density, elevation).

Everything lives in the `FluidSimulator` component and the `useFluidSimulator` composable it calls — there is no store, server procedure, or persistence; parameters reset on leave. The sky is baked into an environment map with `PMREMGenerator` and re-baked whenever the sun moves, which is what makes the water and box reflect the sky believably.

## Key files

| File                                                   | Role                                                |
| ------------------------------------------------------ | --------------------------------------------------- |
| `apps/web/app/pages/fluid-simulator.vue`               | the page: mounts the simulator at the viewport size |
| `apps/web/app/components/Visual/FluidSimulator.vue`    | the container the canvas and the profiler attach to |
| `apps/web/app/composables/visual/useFluidSimulator.ts` | the entire scene: setup, GUI, render loop, disposal |

## Notes

- It is a rendering showcase, not a physics simulation — the "fluid" is the three.js ocean shader (animated normals), and the page exists to exercise the WebGPU render pipeline (`RenderPipeline` + TSL bloom node).
- All GPU resources are explicitly disposed on unmount; the component's scoped CSS overrides keep the three.js profiler panels below the app's own overlays, and the canvas is sized to the viewport less the dock.
- The area is a finished demo with no roadmap. Extending it into real fluid dynamics was considered and [rejected](../../rejected/fluid-simulator/).
