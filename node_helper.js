"use strict";

var NodeHelper = require("node_helper");
const { TransportApiClient } = require("./core/transport-api-client");
module.exports = NodeHelper.create({
  start: function () {
    this.departuresFetchers = [];
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "CREATE_TRANSPORT_CLIENT":
        this.createFetcher(payload);
        break;
      case "FETCH_DEPARTURES":
        this.fetchDepartures(payload);
        break;
    }
  },

  createFetcher: function (config) {
    let fetcher;

    if (typeof this.departuresFetchers[config.identifier] === "undefined") {
      fetcher = new TransportApiClient(config);
      this.departuresFetchers[config.identifier] = fetcher;
      console.log(
        "Transportation fetcher for station with id '" +
        fetcher.getModuleInstanceID() +
        "' created."
      );

      this.sendFetcherLoaded(fetcher);
    } else {
      fetcher = this.departuresFetchers[config.identifier];
      console.log(
        "Using existing transportation fetcher for station id '" +
        fetcher.getModuleInstanceID() +
        "'."
      );

      this.sendFetcherLoaded(fetcher);
    }
  },

  sendFetcherLoaded: function (fetcher) {
    this.sendSocketNotification("TRANSPORT_CLIENT_INITIALIZED", {
      identifier: fetcher.getIdentifier()
    });
  },

  fetchDeparturesFromFirstStation: function (identifier, station) {
    let fetcher = this.departuresFetchers[identifier];
    console.log('fetchDeparturesFromFirstStation for id: ' + station.id);
    fetcher
      .requestStationboardById(station.id)
      .limitResponse(10)
      .send()
      .then(stationboardResponse => {
        console.log('got stationboard count: ' + stationboardResponse.length);
        let payload = {
          identifier: fetcher.getIdentifier(),
          departures: stationboardResponse
        };
        this.sendSocketNotification("DEPARTURES_FETCHED", payload);
      })
      .catch(err => {
        console.log(err)
      });
  },

  fetchDepartures(identifier) {
    let fetcher = this.departuresFetchers[identifier];
    if (fetcher != null) {
      if (fetcher.getUseGeoLocation() == false) {
        this.fetchDeparturesByStationName(identifier, fetcher);
      }
      else {
        this.fetchDeparturesByGeoLocation(identifier, fetcher);
      }
    }
  },

  fetchDeparturesByStationName(identifier, fetcher) {
    console.log('starting to fetchDeparturesByStationName for: ' + fetcher.getStationName());
    fetcher
      .requestLocationsByName(fetcher.getStationName())
      .send()
      .then(fetchedDepartures => {
        console.log('got station count: ' + fetchedDepartures.length);
        if (fetchedDepartures && fetchedDepartures.length > 0) {
          this.fetchDeparturesFromFirstStation(identifier, fetchedDepartures[0])
        }
      })
      .catch(error => {
        let payload = {
          identifier: fetcher.getIdentifier(),
          error: error
        };

        this.sendSocketNotification("FETCH_ERROR", payload);
      });
  },

  fetchDeparturesByGeoLocation(identifier, fetcher) {
    console.log('starting to fetchDeparturesByGeoLocation');
    fetcher
      .requestLocationsByCoordinates(fetcher.getX(), fetcher.getY())
      .send()
      .then(fetchedDepartures => {
        console.log('got station count: ' + fetchedDepartures.length);
        if (fetchedDepartures && fetchedDepartures.length > 0) {
          const station = fetchedDepartures.find(el => el.id !== null);
          this.fetchDeparturesFromFirstStation(identifier, station);
        }
      })
      .catch(error => {
        let payload = {
          identifier: fetcher.getIdentifier(),
          error: error
        };

        this.sendSocketNotification("FETCH_ERROR", payload);
      });
  }
});
