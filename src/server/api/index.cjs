/* Copyright G. Hemingway, @2022 - All rights reserved */
"use strict";

module.exports = (app) => {
  require("./v1/user.cjs")(app);
  require("./v1/session.cjs")(app);
  require("./v1/game.cjs")(app);
};
