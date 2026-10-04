// An image's Sobel gradients along x and y, and their magnitude, pixel by pixel
export interface SobelGradients {
  magnitudes: Float32Array;
  xGradients: Float32Array;
  yGradients: Float32Array;
}
