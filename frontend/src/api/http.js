// src/api/http.js
import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://localhost:8080/api"
    : "/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true, // safe even if unused
});

export default http;
