import type RealtimeKitVideoBackgroundTransformer from "@cloudflare/realtimekit-virtual-background";

// How a pick leaves the camera's video: with the middleware it composites, or with none, which clears the one in place
export interface VideoChange {
  middleware?: Awaited<ReturnType<RealtimeKitVideoBackgroundTransformer["createStaticBackgroundVideoMiddleware"]>>;
}
