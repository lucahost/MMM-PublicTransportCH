"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var location_request_1 = require("./requests/location-request");
var connection_request_1 = require("./requests/connection-request");
var stationboard_request_1 = require("./requests/stationboard-request");
var moment = require("moment");
var TransportApiClient = /** @class */ (function() {
  class TransportApiClient {
    constructor() {}
    /**
     * Provides a custom location request by location name
     * @param {string} name
     * @return {LocationRequest}
     */
    requestLocationsByName(name) {
      return location_request_1.LocationRequest.byName(name);
    }
    /**
     * Provides a custom location request by coordinates
     * @param {number} x
     * @param {number} y
     * @return {LocationRequest}
     */
    requestLocationsByCoordinates(x, y) {
      return location_request_1.LocationRequest.byCoordinates(x, y);
    }
    /**
     * Provides a custom connection request
     * @param from depart location
     * @param to arrive location
     * @return {ConnectionRequest}
     */
    requestConnections(from, to) {
      return connection_request_1.ConnectionRequest.byFromTo(from, to);
    }
    /**
     * Provides a custom stationboard request based on station name
     * @param {string} station for stationboard
     * @return {StationboardRequest}
     */
    requestStationboardByName(station) {
      return stationboard_request_1.StationboardRequest.byStationName(station);
    }
    /**
     * Provides a custom stationboard request based on station ID
     * @param {string} station
     * @return {StationboardRequest}
     */
    requestStationboardById(station) {
      return stationboard_request_1.StationboardRequest.byStationId(station);
    }
    /**
     * Get stations by a location name
     * @param {string} locationName
     * @return {Promise<Array<Location>>}
     */
    getStationsIn(locationName) {
      var locationRequest = location_request_1.LocationRequest.byName(
        locationName
      );
      return locationRequest.send();
    }
    /**
     * Get the departures of a station for the next hour, but at max. 10 departures
     * @param {string} stationName
     * @return {Array<StationboardItem>}
     */
    getNextDepartures(stationName) {
      var maxDate = moment().add(1, "h");
      var request = stationboard_request_1.StationboardRequest.byStationName(
        stationName
      ).limitResponse(10);
      return request.send().then(function(response) {
        var stationboard = [];
        for (var _i = 0, response_1 = response; _i < response_1.length; _i++) {
          var item = response_1[_i];
          if (moment.unix(item.stop.departureTimestamp).isBefore(maxDate)) {
            stationboard.push(item);
          }
        }
        return stationboard;
      });
    }
  }
  return TransportApiClient;
})();
exports.TransportApiClient = TransportApiClient;
