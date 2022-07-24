import axios from "axios";
import { serviceUrl } from "../fixtures.js";
import { svalbard } from "../fixtures.js";

export const placeMarkService = {
  placeMarkUrl: serviceUrl,

  async createUser(user) {
    const res = await axios.post(`${this.placeMarkUrl}/api/users`, user);
    return res.data;
  },

  async getUser(id) {
    const res = await axios.get(`${this.placeMarkUrl}/api/users/${id}`);
    return res.data;
  },

  async getUserByEmail(email) {
    const res = await axios.post(`${this.placeMarkUrl}/api/users/find`, {email: email});
    return res.data;
  },

  async getAllUsers() {
    const res = await axios.get(`${this.placeMarkUrl}/api/users`);
    return res.data;
  },

  async deleteAllUsers() {
    const res = await axios.delete(`${this.placeMarkUrl}/api/users`);
    return res.data;
  },

  async createPlace(place) {
    const res = await axios.post(`${this.placeMarkUrl}/api/placemark`, place);
    return res.data;
  },

  async deleteAllPlaces() {
    const response = await axios.delete(`${this.placeMarkUrl}/api/placemark`);
    return response.data;
  },

  async deletePlace(id) {
    const response = await axios.delete(`${this.placeMarkUrl}/api/placemark/${id}`);
    return response;
  },

  async getAllPlaces() {
    const res = await axios.get(`${this.placeMarkUrl}/api/placemark`);
    return res.data;
  },

  async getPlace(id) {
    const res = await axios.get(`${this.placeMarkUrl}/api/placemark/${id}`);
    return res.data;
  },

  async createCategory(category) {
    const res = await axios.post(`${this.placeMarkUrl}/api/placemark/category`, category);
    return res.data;
  },

  async deleteAllCategories() {
    const response = await axios.delete(`${this.placeMarkUrl}/api/placemark/category`);
    return response.data;
  },

  async deleteCategory(id) {
    const response = await axios.delete(`${this.placeMarkUrl}/api/placemark/category/${id}`);
    return response;
  },

  async deletePlaceFromCategory(placeId, categoryId) {
    const response = await axios.delete(`${this.placeMarkUrl}/api/placemark/category/${categoryId}/places/${placeId}`);
    return response;
  },

  async getAllCategories() {
    const res = await axios.get(`${this.placeMarkUrl}/api/placemark/category`);
    return res.data;
  },

  async getCategory(id) {
    const res = await axios.get(`${this.placeMarkUrl}/api/placemark/category/${id}`);
    return res.data;
  },

  async getPlacesInCategory(id) {
    const res = await axios.get(`${this.placeMarkUrl}/api/placemark/category/${id}/places`);
    return res.data;
  },

  async addPlaceToCategory(placeId, categoryId) {
    const res = await axios.post(`${this.placeMarkUrl}/api/placemark/category/${categoryId}/places`, { placeId: placeId });
    return res.data;
  },

  async authenticate(user) {
    const response = await axios.post(`${this.placeMarkUrl}/api/users/authenticate`, user);
    // eslint-disable-next-line dot-notation
    axios.defaults.headers.common["Authorization"] = `Bearer ${  response.data.token}`;
    return response.data;
  },

  async clearAuth() {
    // eslint-disable-next-line dot-notation
    axios.defaults.headers.common["Authorization"] = "";
  },
};
