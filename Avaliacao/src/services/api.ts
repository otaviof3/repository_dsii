import axios from "axios";

const BASE_URL = "";
const TOKEN = "";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: TOKEN,
  },
});
