"use strict";

Module.register("MMM-PublicTransportCH", {
  // Default module config.
  defaults: {
    text: "Hello World!"
  },

  start: function() {
    this.mySpecialProperty = "So much wow!";
    Log.log(this.name + " is started!");
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
      de: "translations/de.json"
    };
  },

  getDom: function() {
    var wrapper = document.createElement("div");
    wrapper.innerHTML = "Hello world!";
    return wrapper;
  }
});
