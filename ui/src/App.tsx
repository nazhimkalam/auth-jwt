import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import axios from "axios";
import Cookies from "js-cookie";

const App = () => {

  const refreshAccessToken = async (refreshToken: string) => {
    await axios.post("http://localhost:8080/token", { token: refreshToken }).then((response) => {
        if (!response.data) return;
        const { accessToken } = response.data;
        Cookies.set("accessToken", accessToken);

      }).catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    let accessToken: string | undefined = Cookies.get("accessToken");
    let refreshToken: string | undefined = Cookies.get("refreshToken");
    let tokenExpiresAt: number = parseInt(Cookies.get("expiresAt") || "0");

    if (accessToken && refreshToken) {
      setInterval(() => {
        refreshAccessToken(refreshToken!)
      }, tokenExpiresAt);
    }

  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;
