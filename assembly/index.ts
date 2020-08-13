// The entry file of your WebAssembly module.

export function createPointCloud(values: Float32Array, smoothing: f32, halfHeight: f32): Float32Array {
  const pointCloud: Float32Array = new Float32Array(values.length * 2 + 4); // + 4 because of start and endpoint
  const halfLength: i32 = values.length / 2;

  pointCloud[0] = 0;
  pointCloud[1] = halfHeight;

  let j: i16 = 2;

  for (let i: i16 = 0; i < values.length; i++, j += 2) {
    const x: f32 = i < halfLength ? (i + 1) * smoothing : (i - f32(halfLength) + 1) * smoothing;
    const y: f32 = i < values.length - 1 ? halfHeight - values[i + 1] * halfHeight : halfHeight;

    if (i === halfLength) {
      pointCloud[j] = 0;
      pointCloud[j + 1] = halfHeight;
    }

    pointCloud[j] = x;
    pointCloud[j + 1] = y;
  }

  // Update the last value to end in the middle zero line of the canvas.
  pointCloud[pointCloud.length - 1] = halfHeight;
  pointCloud[(pointCloud.length / 2) - 1] = halfHeight;

  return pointCloud;
}

export function waveformAlgorithm(steps: i32, leftChannelData: Float32Array, rightChannelData: Float32Array): Float32Array {
  const sampleStep: i32 = ceil(leftChannelData.length / steps); // This number indicates how many samples are grouped together.

  trace('values', 3, leftChannelData.length, steps, sampleStep);

  const peakValues = new Float32Array(steps * 2); // Stores the peak values. Positives go to first half, negatives to second half.

  let k: i32 = 0;
  let minVal: f32 = 0, maxVal: f32 = 0;

  for (let i: i32 = 0; i < steps; i++) {
    minVal = 0;
    maxVal = 0;

    for (let j: i32 = 0; j < sampleStep; j++) {
      const dataLeft: f32 = leftChannelData[(i * sampleStep) + j];
      const dataRight: f32 = rightChannelData[(i * sampleStep) + j];

      maxVal = max(abs(dataLeft), maxVal);
      maxVal = max(abs(dataRight), maxVal);

      minVal = min(dataLeft, minVal);
      minVal = min(dataRight, minVal);
    }

    peakValues[k] = maxVal;
    peakValues[k + steps] = minVal;

    k++;
  }

  return peakValues;
}

export const leftChannelDataArray = idof<Float32Array>();
export const rightChannelDataArray = idof<Float32Array>();

export function createWaveformPointCloud(completeWidth: f32, height: i32, leftChannelData: Float32Array, rightChannelData: Float32Array, smoothing: f32 = 2): Float32Array {
  const steps: i32 = i32(ceil(completeWidth / smoothing)) + 1;
  const peakValues = waveformAlgorithm(steps, leftChannelData, rightChannelData);

  return createPointCloud(peakValues, smoothing, f32(height / 2));
}