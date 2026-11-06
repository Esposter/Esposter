export const GlobeConfiguration = {
  arcGrowTime: Temporal.Duration.from({ milliseconds: 1500 }).total("milliseconds"),
  arcHoldTime: Temporal.Duration.from({ milliseconds: 1200 }).total("milliseconds"),
  // How long after the one before it each order of arcs starts
  arcStagger: Temporal.Duration.from({ milliseconds: 400 }).total("milliseconds"),
  atmosphereColor: "#3a228a",
  atmosphereScale: 1.18,
  color: "#3a228a",
  dotColor: "#ffffff",
  dotOpacity: 0.7,
  dotRadius: 0.55,
  emissive: "#220038",
  emissiveIntensity: 0.1,
  fogColor: "#535ef3",
  // How far below the viewport the globe's code starts loading, so it is drawn by the time the reader arrives
  loadMargin: "0px 0px 100% 0px",
  // The tilt the globe rests at, so the poles lean towards the reader
  oblique: -Math.PI / 6,
  pulseMaxRadius: 3,
  // Each step down in quality thins the dots and lowers the pixel ratio
  qualityTiers: [
    { densityScale: 1, pixelRatio: 2 },
    { densityScale: 0.65, pixelRatio: 1.5 },
    { densityScale: 0.45, pixelRatio: 1.25 },
    { densityScale: 0.3, pixelRatio: 1 },
  ],
  radius: 100,
  sampleCount: 50,
  shininess: 0.7,
  // The gap between neighbouring land dots, in degrees of arc
  spacing: 1,
  // Mean frames per second over `sampleCount` frames under which the quality steps down
  targetFps: 55.5,
  // The first frames pay for compiling the shaders, so they say nothing of the frame rate
  warmupFrames: 10,
  tubeRadialSegments: 6,
  tubeSegments: 44,
};
