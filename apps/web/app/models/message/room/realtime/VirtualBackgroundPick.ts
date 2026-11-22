import type { VideoChange } from "#src/models/message/room/realtime/VideoChange";
import type RealtimeKitClient from "@cloudflare/realtimekit";
import type RealtimeKitVideoBackgroundTransformer from "@cloudflare/realtimekit-virtual-background";

// A pick as its pipeline resolved it. A pick with no `videoChange` leaves the video as it is
export interface VirtualBackgroundPick {
  // Set only when the run built the transformer itself, so the commit keeps it and an uncommitted run releases it
  createdTransformer?: RealtimeKitVideoBackgroundTransformer | undefined;
  meeting: RealtimeKitClient;
  videoChange?: undefined | VideoChange;
}
