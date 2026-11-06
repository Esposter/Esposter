// The browser reports UTC minus local time in minutes, and a degree of longitude is four minutes, so the reader's own
// Longitude is minus the offset over four. Turning the globe by that longitude's negative faces it to the camera
export const getStartRotationY = (timezoneOffset: number) => (timezoneOffset * Math.PI) / 720;
