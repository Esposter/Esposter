// Where the login's glide stands: the metres the world has scrolled toward the camera, its speed in metres a second,
// And, once the door is due, the scroll it comes to rest at, a whole number of the walkway's copies along, with where
// And how fast its approach there began and how long it has run
export interface LoginGlide {
  approach?: { elapsedSeconds: number; startScrolled: number; startSpeed: number };
  scrolled: number;
  speed: number;
  stopAt?: number;
}
