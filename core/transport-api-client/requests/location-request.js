"use strict";
var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function(d, b) {
          d.__proto__ = b;
        }) ||
      function(d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
      };
    return function(d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
var transport_api_request_1 = require("./transport-api-request");
var WebRequest = require("web-request");
var LocationRequest = /** @class */ (function(_super) {
  __extends(LocationRequest, _super);
  function LocationRequest() {
    return _super.call(this, "locations") || this;
  }
  /**
   * Creates new LocationRequest finding locations by name
   * @param query Location search string
   * @returns new request
   */
  LocationRequest.byName = function(query) {
    return new LocationRequest().addParam("query", query);
  };
  /**
   * Creates new LocationRequest finding locations by coordinates
   * @param x Latitude coordinate
   * @param y Longitude coordinate
   * @returns new request
   */
  LocationRequest.byCoordinates = function(x, y) {
    return new LocationRequest()
      .addParam("x", String(x))
      .addParam("y", String(y));
  };
  /**
   * Find locations of specific type. Works only with byName
   * @param {LocationType} type
   * @returns {LocationRequest} this request
   */
  LocationRequest.prototype.ofType = function(type) {
    return this.addParam("type", type);
  };
  /**
   * Find locations which have access to specific type(s) of transportation. Works only with byCoordinates
   * @param {TransportationType} transportations
   * @returns {LocationRequest} this request
   */
  LocationRequest.prototype.withTransports = function() {
    var transportations = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      transportations[_i] = arguments[_i];
    }
    for (
      var _a = 0, transportations_1 = transportations;
      _a < transportations_1.length;
      _a++
    ) {
      var transportation = transportations_1[_a];
      this.addParam("transportations[]", transportation);
    }
    return this;
  };
  LocationRequest.prototype.send = function() {
    return WebRequest.json(this.url).then(function(value) {
      return value.stations;
    });
  };
  return LocationRequest;
})(transport_api_request_1.TransportApiRequest);
exports.LocationRequest = LocationRequest;
