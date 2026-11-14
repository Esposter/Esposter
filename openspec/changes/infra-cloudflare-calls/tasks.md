# Tasks

## 1.

- [ ] 1.1 Confirm RealtimeKit's REST API removes a participant and changes a participant's preset, and stop and report if either is missing. Verified by the REST reference.

## 2.

- [ ] 2.1 Replace the server's LiveKit services and webhook with RealtimeKit's. Verified by the call router's tests.

## 3.

- [ ] 3.1 Replace `useLiveKitStore` with a RealtimeKit store, the microphone processor as an audio middleware and virtual backgrounds through RealtimeKit's package. Verified by the call store tests.

## 4.

- [ ] 4.1 Delete `livekit-server`, `livekit-monitor` and the LiveKit dependencies. Verified by no LiveKit import remaining.
