import { CanvasKeyAction } from "@/models/pageBuilder/CanvasKeyAction";

// The command the canvas itself takes for a key pressed in its frame, or none for a key the editor takes instead
export const getCanvasKeyAction = (key: string): CanvasKeyAction | undefined => {
  switch (key) {
    case "ArrowDown":
      return CanvasKeyAction.Next;
    case "ArrowUp":
      return CanvasKeyAction.Previous;
    case "Escape":
      return CanvasKeyAction.Parent;
    default:
      return undefined;
  }
};
