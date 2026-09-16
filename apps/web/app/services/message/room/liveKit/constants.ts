import packageJson from "@livekit/track-processors/package.json" with { type: "json" };

// `@livekit/track-processors` loads the segmenter from this CDN path at its own pinned `@mediapipe/tasks-vision`
// Version, so the CSP entry reads that pin rather than restating a number a dependency bump moves
export const MEDIAPIPE_TASKS_VISION_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${packageJson.dependencies["@mediapipe/tasks-vision"]}/wasm/vision_wasm_internal.js`;
