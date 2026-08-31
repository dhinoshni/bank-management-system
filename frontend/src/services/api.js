import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000"
});

API.interceptors.request.use(
  (config) => {

    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================

    const storedUser = localStorage.getItem("user");

    let user = null;

    try {
      user = storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch (error) {
      console.error(
        "Invalid user data in localStorage"
      );
    }


    // =====================================================
    // GET TOKEN
    // =====================================================
    //
    // First try:
    // user.token
    //
    // Then fallback to:
    // localStorage.token
    //
    // =====================================================

    const token =
      user?.token ||
      localStorage.getItem("token");


    // =====================================================
    // ADD AUTHORIZATION HEADER
    // =====================================================

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }


    return config;
  },

  (error) => {

    return Promise.reject(error);

  }
);

export default API;