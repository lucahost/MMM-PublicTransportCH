"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Checkpoint = /** @class */ (function() {
  class Checkpoint {
    constructor() {}
  }
  Object.defineProperty(Checkpoint.prototype, "station", {
    get: function() {
      return this._station;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(Checkpoint.prototype, "arrival", {
    get: function() {
      return this._arrival;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(Checkpoint.prototype, "arrivalTimestamp", {
    get: function() {
      return this._arrivalTimestamp;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(Checkpoint.prototype, "departure", {
    get: function() {
      return this._departure;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(Checkpoint.prototype, "departureTimestamp", {
    get: function() {
      return this._departureTimestamp;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(Checkpoint.prototype, "delay", {
    get: function() {
      return this._delay;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(Checkpoint.prototype, "platform", {
    get: function() {
      return this._platform;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(Checkpoint.prototype, "prognosis", {
    get: function() {
      return this._prognosis;
    },
    enumerable: true,
    configurable: true
  });
  return Checkpoint;
})();
const _Checkpoint = Checkpoint;
export { _Checkpoint as Checkpoint };
