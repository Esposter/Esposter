// The login screen's stages, in the order the game plays them: the scene fading up out of white with its wait mark,
// The title waiting for a click, the camera's flight while the game prepares, the door waiting for a click, and the
// Door lighting as the screen whitens
export enum LoginStage {
  Arriving = "Arriving",
  Door = "Door",
  Entering = "Entering",
  Preparing = "Preparing",
  Title = "Title",
}
