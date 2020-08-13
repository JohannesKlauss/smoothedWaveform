const assert = require("assert");
const myModule = require("..");
const {performance} = require('perf_hooks');

if (!Float32Array.__proto__.from) {
  (function () {
    Float32Array.__proto__.from = function (obj, func, thisObj) {

      var typedArrayClass = Float32Array.__proto__;
      if(typeof this !== 'function') {
        throw new TypeError('# is not a constructor');
      }
      if (this.__proto__ !== typedArrayClass) {
        throw new TypeError('this is not a typed array.');
      }

      func = func || function (elem) {
        return elem;
      };

      if (typeof func !== 'function') {
        throw new TypeError('specified argument is not a function');
      }

      obj = Object(obj);
      if (!obj['length']) {
        return new this(0);
      }
      var copy_data = [];
      for(var i = 0; i < obj.length; i++) {
        copy_data.push(obj[i]);
      }

      copy_data = copy_data.map(func, thisObj);

      var typed_array = new this(copy_data.length);
      for(var i = 0; i < typed_array.length; i++) {
        typed_array[i] = copy_data[i];
      }
      return typed_array;
    }
  })();
}

const expectedOutputPointCloud = require('./fixturesPointCloud');
const expectedOutputPeakValues = require('./fixturesPeakValues');
const expectedOutputLeftChannelData = require('./fixturesLeftChannelSubData');

const completeWidth = 648.6496598639455;
const height = 80;
const leftChannelData = expectedOutputLeftChannelData;
console.log('le', expectedOutputPeakValues.length);

const rightChannelData = new Float32Array(leftChannelData.length);
const smoothing = 2;

const {createWaveformPointCloud, leftChannelDataArray, rightChannelDataArray} = myModule
const {__getArray, __release, __allocArray, __retain} = myModule

function doCreateWaveformPointCloud() {
  const t = performance.now();

  const leftChannelPtr = __retain(__allocArray(leftChannelDataArray, leftChannelData));
  const rightChannelPtr = __retain(__allocArray(rightChannelDataArray, rightChannelData));

  const arrPtr = createWaveformPointCloud(completeWidth, height, leftChannelPtr, rightChannelPtr, smoothing);
  const values = __getArray(arrPtr);

  console.log('calc', performance.now() - t);

  assert.strictEqual(values.length, expectedOutputPointCloud.length);
  assert.equal(values.map(x => parseInt(x)), expectedOutputPointCloud.slice(0, 40).map(x => parseInt(x)));

  __release(leftChannelPtr);
  __release(rightChannelPtr);
  __release(arrPtr);

  console.log("ok");
}

doCreateWaveformPointCloud();


