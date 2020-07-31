const assert = require("assert");
const myModule = require("..");
const AudioContext = require("web-audio-api").AudioContext;

const expectedOutput = require('./fixtures');

const ctx = new AudioContext();

const fsPromises = require('fs').promises;
fsPromises.readFile('./tests/default.wav').then(function(data) {
  return new Promise(function(resolve, reject) {
    ctx.decodeAudioData(data, function(dataBuffer) {
      return resolve(dataBuffer);
    }, function(err) {
      reject(err);
    });
  });
}).then(function(bufferResult) {
  const completeWidth = 645;
  const height = 70;
  const leftChannelData = bufferResult.getChannelData(0);
  const rightChannelData = new Float32Array(leftChannelData.length).fill(0);
  const smoothing = 2;

  const { createWaveformPointCloud } = myModule
  const { __getArray, __release } = myModule

  function doCreateWaveformPointCloud() {
    const arrPtr = createWaveformPointCloud(completeWidth, height, leftChannelData, rightChannelData, smoothing);
    const values = __getArray(arrPtr);

    assert.strictEqual(values, expectedOutput);

    __release(arrPtr);

    console.log("ok");
  }

  doCreateWaveformPointCloud();
});


