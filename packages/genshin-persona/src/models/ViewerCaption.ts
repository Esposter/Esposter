// One clip of a reply as the viewer shows it: the line the clip speaks, the clip's length, and the frame colour of the
// Character's nameplate
export interface ViewerCaption {
  color: number;
  durationMs: number;
  text: string;
}
