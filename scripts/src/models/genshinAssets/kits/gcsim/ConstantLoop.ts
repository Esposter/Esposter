// A `for` loop of constant bounds, `for delay := burstStart; delay < 12*60+burstStart; delay += 90 {`, or over a constant
// Slice, `for i, delay := range burstHitmarks {`, its iterations' variable values and the braces of its body
export interface ConstantLoop {
  bodyEnd: number;
  bodyStart: number;
  iterations: Map<string, number>[];
}
