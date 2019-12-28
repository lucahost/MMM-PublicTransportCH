"use strict";

Module.register("MMM-PublicTransportCH", {
  // Default module config.
  defaults: {
    name: "MMM-PublicTransportHafas",
    hidden: false,
    updatesEvery: 120, // How often should the table be updated in s?

    // Header
    headerPrefix: "",
    headerAppendix: "",

    // Departures options
    direction: "", // Show only departures heading to this station. (A station ID.)
    ignoredLines: [], // Which lines should be ignored? (comma-separated list of line names)
    excludedTransportationTypes: [], // Which transportation types should not be shown on the mirror? (comma-separated list of types) possible values: StN for tram, BuN for bus, s for suburban
    timeToStation: 10, // How long do you need to walk to the next Station?
    timeInFuture: 40, // Show departures for the next *timeInFuture* minutes.

    // Look and Feel
    marqueeLongDirections: true, // Use Marquee effect for long station names?
    replaceInDirections: {}, // key-value pairs which are used to replace `key` by `value` in the displayed directions
    showColoredLineSymbols: true, // Want colored line symbols?
    useColorForRealtimeInfo: true, // Want colored real time information (timeToStation, early)?
    showAbsoluteTime: true, // How should the departure time be displayed? "15:10" (absolute) or "in 5 minutes" (relative)
    showTableHeaders: true, // Show table headers?
    showTableHeadersAsSymbols: true, // Table Headers as symbols or written?
    tableHeaderOrder: ["time", "line", "direction"], // In which order should the table headers appear?
    maxUnreachableDepartures: 0, // How many unreachable departures should be shown?
    maxReachableDepartures: 7, // How many reachable departures should be shown?
    fadeUnreachableDepartures: true,
    fadeReachableDepartures: true,
    fadePointForReachableDepartures: 0.25,
    customLineStyles: "zuerich", // Prefix for the name of the custom css file. ex: Leipzig-lines.css (case sensitive)
    showOnlyLineNumbers: false // Display only the line number instead of the complete name, i. e. "11" instead of "STR 11"
  },

  start: function () {
    Log.info(
      "Starting module: " + this.name + " with identifier: " + this.identifier
    );

    if (navigator) {
      if (navigator.geolocation) {
        var options = {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        };
        navigator.geolocation.getCurrentPosition((position => {
          console.log("lat: " + position.coords.latitude);
          console.log("lon: " + position.coords.longitude);
        }), (errorCallback => {
          console.log(errorCallback);
        }), options);
      }
    } else {
      Log.info("navigator not found");
    }

    this.departures = [];
    this.initialized = false;
    this.error = {};

    this.sanitzeConfig();

    if (!this.config.stationID) {
      Log.error("stationID not set! " + this.config.stationID);
      this.error.message = this.translate("NO_STATION_ID_SET");

      return;
    }
    let fetcherOptions = {
      identifier: this.identifier,
      stationName: this.config.stationName,
      stationID: this.config.stationID,
      timeToStation: this.config.timeToStation,
      timeInFuture: this.config.timeInFuture,
      direction: this.config.direction,
      ignoredLines: this.config.ignoredLines,
      excludedTransportationTypes: this.config.excludedTransportationTypes,
      maxReachableDepartures: this.config.maxReachableDepartures,
      maxUnreachableDepartures: this.config.maxUnreachableDepartures
    };

    this.sendSocketNotification("CREATE_TRANSPORT_CLIENT", fetcherOptions);
  },

  getDom: function () {
    let domBuilder = new PTCHDomBuilder(this.config);

    if (this.hasErrors()) {
      return domBuilder.getSimpleDom(this.error.message);
    }

    if (!this.initialized) {
      return domBuilder.getSimpleDom(this.translate('LOADING'));
    }

    let headings = {
      time: this.translate("PTCH_DEPARTURE_TIME"),
      line: this.translate("PTCH_LINE"),
      direction: this.translate("PTCH_TO")
    };

    let noDeparturesMessage = this.translate("PTCH_NO_DEPARTURES");

    return domBuilder.getDom(this.departures, headings, noDeparturesMessage);
  },

  getStyles: function () {
    let styles = [this.file("css/styles.css"), "font-awesome.css"];

    if (this.config.customLineStyles !== "") {
      let customStyle = "css/" + this.config.customLineStyles + "-lines.css";
      styles.push(this.file(customStyle));
    }

    return styles;
  },

  getScripts: function () {
    return [
      "moment.js",
      this.file("core/PTCHDomBuilder.js"),
      this.file("core/PTCHTableBodyBuilder.js")
    ];
  },

  getTranslations: function () {
    return {
      en: "translations/en.json",
      de: "translations/de.json"
    };
  },

  socketNotificationReceived: function (notification, payload) {
    console.log('socketNotificationReceived: ' + notification)
    if (!this.isForThisStation(payload)) {
      console.log('not for identifier!')
      return;
    }
    switch (notification) {
      case "TRANSPORT_CLIENT_INITIALIZED":
        this.initialized = true;
        this.startFetchingLoop(this.config.updatesEvery);

        break;

      case "DEPARTURES_FETCHED":
        // reset error object
        this.error = {};
        this.departures = payload.departures;
        this.updateDom(2000);

        break;

      case "FETCH_ERROR":
        this.error = payload.error;
        this.departures = [];
        this.updateDom(2000);

        break;
    }
  },

  isForThisStation: function (payload) {
    return payload.identifier === this.identifier;
  },

  sanitzeConfig: function () {
    if (this.config.updatesEvery < 30) {
      this.config.updatesEvery = 30;
    }

    if (this.config.timeToStation < 0) {
      this.config.timeToStation = 0;
    }

    if (this.config.timeInFuture < this.config.timeToStation + 30) {
      this.config.timeInFuture = this.config.timeToStation + 30;
    }

    if (this.config.maxUnreachableDepartures < 0) {
      this.config.maxUnreachableDepartures = 0;
    }

    if (this.config.maxReachableDepartures < 0) {
      this.config.maxReachableDepartures = this.defaults.maxReachableDepartures;
    }
  },

  startFetchingLoop: function (interval) {
    // start immediately ...
    this.sendSocketNotification("FETCH_DEPARTURES", this.identifier);

    // ... and then repeat in the given interval
    setInterval(() => {
      this.sendSocketNotification("FETCH_DEPARTURES", this.identifier);
    }, interval * 1000);
  },

  hasErrors: function () {
    return Object.keys(this.error).length > 0;
  }
});
