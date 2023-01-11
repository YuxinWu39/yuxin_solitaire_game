/* Copyright G. Hemingway, @2022 - All rights reserved */
"use strict";

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

export const Logout = ({ logOut }) => {
  let navigate = useNavigate();
  useEffect(() => {
    // Log out the actual user - i.e. clear user data
    logOut();
    // Go to login page
    navigate("/login");
  });
  return <></>;
};

Logout.propTypes = {
  logOut: PropTypes.func.isRequired,
};
