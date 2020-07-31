// The entry file of your WebAssembly module.

export function createPointCloud(values: Array<f32>, smoothing: f32, halfHeight: f32): Array<f32> {
  const pointCloud: Array<f32> = new Array<f32>(values.length * 2 + 7);
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

function waveformAlgorithm(steps: i32, leftChannelData: Array<f32>, rightChannelData: Array<f32>): Array<f32> {
  const sampleStep: i32 = ceil(leftChannelData.length / steps); // This number indicates how many samples are grouped together.

  const peakValues = new Array<f32>(steps * 2); // Stores the peak values. Positives go to first half, negatives to second half.

  let k = 0;

  for (let i: i32 = 0; i < steps; i++) {
    let min: f32 = 1, max: f32 = -1;

    for (let j: i32 = 0; j < sampleStep; j++) {
      let bufferVal: f32 = 0;

      const dataLeft: f32 = leftChannelData[(i * sampleStep) + j];
      const dataRight: f32 = rightChannelData[(i * sampleStep) + j];

      if (abs(dataLeft) > abs(bufferVal)) { // (i * step) is the bucket or starting index of the bucket.
        bufferVal = dataLeft;
      }

      if (abs(dataRight) > abs(dataRight)) {
        bufferVal = dataRight;
      }

      if (bufferVal < min) {
        min = bufferVal;
      }

      if (bufferVal > max) {
        max = bufferVal;
      }
    }

    peakValues[k] = max;
    peakValues[k + steps] = min;

    k++;
  }

  return peakValues;
}

export function createWaveformPointCloud(completeWidth: i32, height: i32, leftChannelData: Array<f32>, rightChannelData: Array<f32>, smoothing: f32 = 2): Array<f32> {
  const steps: i32 = i32(ceil(f32(completeWidth) / smoothing));
  const peakValues = waveformAlgorithm(steps, leftChannelData, rightChannelData);

  return createPointCloud(peakValues, smoothing, f32(height / 2));
}