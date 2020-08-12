// The entry file of your WebAssembly module.

export function createPointCloud(values: Array<f32>, smoothing: f32, halfHeight: f32): Array<f32> {
  const pointCloud: Array<f32> = new Array<f32>(values.length * 2 + 4);
  const halfLength: i32 = values.length / 2;

  pointCloud[0] = 0;
  pointCloud[1] = halfHeight;

  for (let i: i16 = 2; i < values.length; i += 2) {
    const x: f32 = i < halfLength ? (i + 1) * smoothing : (i - f32(halfLength) + 1) * smoothing;
    const y: f32 = i < values.length - 1 ? halfHeight - values[i + 1] * halfHeight : halfHeight;
    const pad: i32 = i < halfLength ? 0 : 1;

    if (i === halfLength) {
      pointCloud[i] = 0;
      pointCloud[i + 1] = halfHeight;
    }

    pointCloud[i + pad] = x;
    pointCloud[i + 1 + pad] = y;
  }

  // Update the last value to end in the middle zero line of the canvas.
  pointCloud[pointCloud.length - 1] = halfHeight;
  pointCloud[(pointCloud.length / 2) - 1] = halfHeight;

  return pointCloud;
}

export function waveformAlgorithm(steps: i32, leftChannelData: Array<f32>, rightChannelData: Array<f32>): Array<f32> {
  const sampleStep: i32 = ceil(leftChannelData.length / steps); // This number indicates how many samples are grouped together.

  const peakValues = new Array<f32>(steps * 2); // Stores the peak values. Positives go to first half, negatives to second half.

  let k: i32 = 0;
  let minVal: f32 = 0, maxVal: f32 = 0;

  for (let i: i32 = 0; i < steps; i++) {
    minVal = -1;
    maxVal = -1;

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

export function createWaveformPointCloud(completeWidth: f32, height: i32, leftChannelData: Array<f32>, rightChannelData: Array<f32>, smoothing: f32 = 2): Array<f32> {
  const steps: i32 = i32(ceil(completeWidth / smoothing)) + 1;
  const peakValues = waveformAlgorithm(steps, leftChannelData, rightChannelData);

  return createPointCloud(peakValues, smoothing, f32(height / 2));
}