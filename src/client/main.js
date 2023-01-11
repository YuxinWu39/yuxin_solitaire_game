/* Copyright G. Hemingway, @2022 - All rights reserved */
"use strict";

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import styled from "styled-components";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Header } from "./components/header.js";
import { Landing } from "./components/landing.js";
import { Login } from "./components/login.js";
import { Logout } from "./components/logout.js";
import { Register } from "./components/register.js";
import { Profile } from "./components/profile.js";
import { Start } from "./components/start.js";
import { Results } from "./components/results.js";
import { Game } from "./components/game.js";
import { Edit } from "./components/edit.js";

const defaultUser = {
  username: "",
  first_name: "",
  last_name: "",
  primary_email: "",
  city: "",
  games: [],
};

const GridBase = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "hd"
    "main"
    "ft";

  @media (min-width: 500px) {
    grid-template-columns: 40px 50px 1fr 50px 40px;
    grid-template-rows: auto auto auto;
    grid-template-areas:
      "hd hd hd hd hd"
      "sb sb main main main"
      "ft ft ft ft ft";
  }
`;

/***
 *
 * @param user
 * @param children
 * @returns {JSX.Element|*}
 * @constructor
 */
const ReqUser = ({ user, children }) =>
  !user || user.username === "" ? (
    <Navigate to={"/login"} replace={true} />
  ) : (
    children
  );

/***
 *
 * @param loggedIn
 * @param username
 * @returns {JSX.Element}
 * @constructor
 */
const CheckRegister = ({ loggedIn, username }) =>
  loggedIn ? (
    <Navigate to={`/profile/${username}`} replace={true} />
  ) : (
    <Register />
  );

/***
 * Main application entry point
 * @returns {JSX.Element}
 * @constructor
 */
const MyApp = () => {
  // If the user has logged in, grab info from sessionStorage
  const data = localStorage.getItem("user");
  let [state, setState] = useState(data ? JSON.parse(data) : defaultUser);
  console.log(`Starting as user: ${state.username}`);

  // Helper to check if the user is logged in or not
  const loggedIn = () => {
    return state.username && state.primary_email;
  };

  // Helper to manage what happens when the user logs in
  const logIn = async (username) => {
    const response = await fetch(`/v1/user/${username}`);
    const user = await response.json();
    localStorage.setItem("user", JSON.stringify(user));
    setState(user);
  };

  // Helper for when a user logs out
  const logOut = () => {
    // Wipe localStorage
    localStorage.removeItem("user");
    // Reset user state
    setState(defaultUser);
  };

  return (
    <BrowserRouter>
      <GridBase>
        <Header user={state.username} email={state.primary_email} />
        <Routes>
          <Route exact path="/" element={<Landing />} />
          <Route path="/login" element={<Login logIn={logIn} />} />
          <Route path="/logout" element={<Logout logOut={logOut} />} />
          <Route
            path="/register"
            element={
              <CheckRegister loggedIn={loggedIn()} username={state.username} />
            }
          />
          <Route
            path="/profile/:username"
            element={<Profile currentUser={state.username} />}
          />
          <Route exact path="/profile/:username/edit" element = {<Edit username={state.username}/>}/>
          <Route
            path="/start"
            element={
              <ReqUser user={state}>
                <Start />
              </ReqUser>
            }
          />
          <Route path="/game/:id" element={<Game user={state} />} />
          <Route path="/results/:id" element={<Results user={state} />} />
        </Routes>
      </GridBase>
    </BrowserRouter>
  );
};

const root = createRoot(document.getElementById("mainDiv"));
root.render(<MyApp />);
