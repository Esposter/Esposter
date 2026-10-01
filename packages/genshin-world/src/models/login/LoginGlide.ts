// Where the login's glide stands: the metres the world has scrolled toward the camera, its speed in metres a second,
// And, once the door is due, the scroll it comes to rest at, a whole number of the walkway's copies along
export interface LoginGlide {
  scrolled: number;
  speed: number;
  stopAt?: number;
}
