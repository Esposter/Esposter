// The stretches of the cooking indicator's bar the two zones that make a Delicious or a Regular dish lie in, each from its
// Start to its end. A stop outside both is a Suspicious dish
export interface CookingZones {
  delicious: [number, number];
  regular: [number, number];
}
