const assert = require("assert");
const myModule = require("..");
const {performance} = require('perf_hooks');

const expectedOutputPointCloud = require('./fixturesPointCloud');
const expectedOutputPeakValues = require('./fixturesPeakValues');
const expectedOutputLeftChannelData = require('./fixturesLeftChannelSubData');

const completeWidth = 648.6496598639455;
const height = 80;
const leftChannelData = expectedOutputLeftChannelData;
const rightChannelData = new Float32Array(leftChannelData.length);
const smoothing = 2;

const {createWaveformPointCloud, waveformAlgorithm} = myModule
const {__getArray, __release} = myModule

function doCreateWaveformPointCloud() {
  const t = performance.now();

  const peaksPtr = waveformAlgorithm(Math.ceil(completeWidth / smoothing) + 1, leftChannelData, rightChannelData);
  const peakValues = __getArray(peaksPtr);

  //assert.strictEqual(peakValues.length, expectedOutputPeakValues.length);
  //assert.strictEqual(peakValues.slice(0, 10), expectedOutputPeakValues.slice(0, 10));

  const arrPtr = createWaveformPointCloud(completeWidth, height, leftChannelData, rightChannelData, smoothing);
  const values = __getArray(arrPtr);

  console.log('calc', performance.now() - t);

  assert.strictEqual(values.length, expectedOutputPointCloud.length);
  assert.strictEqual(values.slice(0, 5), expectedOutputPointCloud.slice(0, 5));

  __release(arrPtr);

  console.log("ok");
}

doCreateWaveformPointCloud();


