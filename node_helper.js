"use strict";

var NodeHelper = require("node_helper");
var TransportApiClient = require("./core/TransportApiClient");
module.exports = NodeHelper.create({
  start: function() {
    this.departuresFetcher = [];
  },

  socketNotificationReceived: function(notification, payload) {
    switch (notification) {
      case "CREATE_TRANSPORT_CLIENT":
        this.createFetcher(payload);
        break;
      case "FETCH_DEPARTURES":
        this.fetchDepartures(payload);
        break;
    }
  },

  createFetcher: function(config) {
    let fetcher;

    if (typeof this.departuresFetcher[config.identifier] === "undefined") {
      fetcher = new TransportApiClient();
      this.departuresFetchers[config.identifier] = fetcher;
      console.log(
        "Transportation fetcher for station with id '" +
          fetcher.getStationID() +
          "' created."
      );

      this.sendFetcherLoaded(fetcher);
    } else {
      fetcher = this.departuresFetchers[config.identifier];
      console.log(
        "Using existing transportation fetcher for station id '" +
          fetcher.getStationID() +
          "'."
      );

      this.sendFetcherLoaded(fetcher);
    }
  },

  sendFetcherLoaded: function(fetcher) {
    this.sendSocketNotification("TRANSPORT_CLIENT_INITIALIZED", {
      identifier: fetcher.getIdentifier()
    });
  },

  fetchDepartures(identifier) {
    let fetcher = this.departuresFetchers[identifier];

    fetcher
      .requestLocationsByName("Hölderlinstrasse")
      .then(fetchedDepartures => {
        let payload = {
          identifier: fetcher.getIdentifier(),
          departures: fetchedDepartures
        };

        this.sendSocketNotification("DEPARTURES_FETCHED", payload);
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
