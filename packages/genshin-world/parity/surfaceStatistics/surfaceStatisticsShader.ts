// The WGSL kernels the parity page's statistics are reduced by: a separable Gaussian pass, an elementwise term, a
// Half-size pass, a similarity term and a sum over the pixels. Every buffer is a flat f32 array a pixel to an element;
// The parameters are one uniform, read by each entry point
export const SURFACE_STATISTICS_SHADER = /* Wgsl */ `
struct Parameters {
  count: u32,
  width: u32,
  height: u32,
  radius: u32,
  mode: u32,
  direction: u32,
  outputOffset: u32,
  mean: f32,
  label: u32,
}

const CONTRAST_CONSTANT: f32 = 0.0009;
const LUMINANCE_CONSTANT: f32 = 0.0001;

@group(0) @binding(0) var<storage, read> blurSource: array<f32>;
@group(0) @binding(1) var<storage, read_write> blurDestination: array<f32>;
@group(0) @binding(2) var<storage, read> blurWeights: array<f32>;
@group(0) @binding(3) var<storage, read> firstValues: array<f32>;
@group(0) @binding(4) var<storage, read> secondValues: array<f32>;
@group(0) @binding(5) var<storage, read> maskValues: array<f32>;
@group(0) @binding(6) var<storage, read_write> combinedValues: array<f32>;
@group(0) @binding(7) var<storage, read> reducedValues: array<f32>;
@group(0) @binding(8) var<storage, read_write> partials: array<f32>;
@group(0) @binding(9) var<uniform> parameters: Parameters;
@group(0) @binding(10) var<storage, read> coverageValues: array<f32>;
@group(0) @binding(11) var<storage, read> coverageMeans: array<f32>;
@group(0) @binding(12) var<storage, read> firstMeans: array<f32>;
@group(0) @binding(13) var<storage, read> secondMeans: array<f32>;
@group(0) @binding(14) var<storage, read> firstSquares: array<f32>;
@group(0) @binding(15) var<storage, read> secondSquares: array<f32>;
@group(0) @binding(16) var<storage, read> productMeans: array<f32>;
@group(0) @binding(17) var<storage, read_write> termShares: array<f32>;

var<workgroup> partialSums: array<f32, 256>;

// A blur along one axis, its edges clamped, the taps centred on the pixel and weighted by the blur's own window
@compute @workgroup_size(16, 16)
fn blurPass(@builtin(global_invocation_id) identifier: vec3<u32>) {
  let x = i32(identifier.x);
  let y = i32(identifier.y);
  let width = i32(parameters.width);
  let height = i32(parameters.height);
  if (x >= width || y >= height) {
    return;
  }
  let radius = i32(parameters.radius);
  var total = 0.0;
  for (var tap = 0; tap <= 2 * radius; tap++) {
    var sampleIndex = 0;
    if (parameters.direction == 0u) {
      sampleIndex = y * width + clamp(x + tap - radius, 0, width - 1);
    } else {
      sampleIndex = clamp(y + tap - radius, 0, height - 1) * width + x;
    }
    total += blurWeights[tap] * blurSource[sampleIndex];
  }
  blurDestination[y * width + x] = total;
}

// One elementwise term a pixel: the mode says which
// 0 the product of the first and second, 1 the first over the second where the second is above zero else 0,
// 2 the mask times the squared difference of the first and second, 3 the mask times the first's squared deviation
// From the mean, 4 the sum of the first and second, 5 one where the first is the label given, else 0
@compute @workgroup_size(256)
fn combinePass(@builtin(global_invocation_id) identifier: vec3<u32>) {
  let index = identifier.x;
  if (index >= parameters.count) {
    return;
  }
  let first = firstValues[index];
  let second = secondValues[index];
  let maskValue = maskValues[index];
  var combined = 0.0;
  switch parameters.mode {
    case 0u: {
      combined = first * second;
    }
    case 1u: {
      combined = select(0.0, first / second, second > 0.0);
    }
    case 2u: {
      let difference = first - second;
      combined = maskValue * difference * difference;
    }
    case 3u: {
      let deviation = first - parameters.mean;
      combined = maskValue * deviation * deviation;
    }
    case 4u: {
      combined = first + second;
    }
    case 5u: {
      combined = select(0.0, 1.0, first == f32(parameters.label));
    }
    default: {}
  }
  combinedValues[index] = combined;
}

// Each output pixel is the mean of the two by two block of the input it covers, the input being parameters.width wide
@compute @workgroup_size(256)
fn halvePass(@builtin(global_invocation_id) identifier: vec3<u32>) {
  let index = identifier.x;
  if (index >= parameters.count) {
    return;
  }
  let halfWidth = parameters.width / 2u;
  let top = (index / halfWidth) * 2u * parameters.width + (index % halfWidth) * 2u;
  let bottom = top + parameters.width;
  combinedValues[index] = (firstValues[top] + firstValues[top + 1u] + firstValues[bottom] + firstValues[bottom + 1u]) / 4.0;
}

// One pixel's similarity term over a label's window, the contrast and structure of the blurred planes over the
// Coverage, and the luminance too at the coarsest scale (mode 1), the term weighted by the pixel's coverage
@compute @workgroup_size(256)
fn similarityPass(@builtin(global_invocation_id) identifier: vec3<u32>) {
  let index = identifier.x;
  if (index >= parameters.count) {
    return;
  }
  let share = coverageValues[index];
  let windowShare = coverageMeans[index];
  if (share == 0.0 || windowShare == 0.0) {
    termShares[index] = 0.0;
    return;
  }
  let firstAverage = firstMeans[index] / windowShare;
  let secondAverage = secondMeans[index] / windowShare;
  let firstVariance = max(firstSquares[index] / windowShare - firstAverage * firstAverage, 0.0);
  let secondVariance = max(secondSquares[index] / windowShare - secondAverage * secondAverage, 0.0);
  let covariance = productMeans[index] / windowShare - firstAverage * secondAverage;
  var term = (2.0 * covariance + CONTRAST_CONSTANT) / (firstVariance + secondVariance + CONTRAST_CONSTANT);
  if (parameters.mode == 1u) {
    term *= (2.0 * firstAverage * secondAverage + LUMINANCE_CONSTANT)
      / (firstAverage * firstAverage + secondAverage * secondAverage + LUMINANCE_CONSTANT);
  }
  termShares[index] = term * share;
}

// Each workgroup sums a strided share of its input, then the workgroup's sums fold into one partial by halves
@compute @workgroup_size(256)
fn reducePass(
  @builtin(local_invocation_id) local: vec3<u32>,
  @builtin(workgroup_id) group: vec3<u32>,
  @builtin(num_workgroups) groups: vec3<u32>,
) {
  var total = 0.0;
  var index = group.x * 256u + local.x;
  let stride = groups.x * 256u;
  while (index < parameters.count) {
    total += reducedValues[index];
    index += stride;
  }
  partialSums[local.x] = total;
  workgroupBarrier();
  for (var span = 128u; span > 0u; span = span / 2u) {
    if (local.x < span) {
      partialSums[local.x] += partialSums[local.x + span];
    }
    workgroupBarrier();
  }
  if (local.x == 0u) {
    partials[parameters.outputOffset + group.x] = partialSums[0];
  }
}
`;
