import type { ViewerMoment } from "#src/models/ViewerMoment";

// The viewer's socket, the model on it and the motion each moment plays there, as the verb wrote them; a moment
// With no motion sends nothing for it
export interface ViewerConfiguration {
  address: string;
  modelId: number;
  motions: Partial<Record<ViewerMoment, string>>;
}
