/*
 * Copyright (C) 2026 Yumi/acdd233/puchen-star
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

console.log("API FILE LOADED");

export const loginUser = async (email: string, password: string) => {
  const response = await api.post("/abe/login", { email, password });
  return response.data;
};

export const registerUser = async (payload: any) => {
  const response = await api.post("/abe/register", { payload });
  return response.data;
};

export const getSystemAttributes = async () => {
  const response = await api.get("/abe/attributes");
  return response.data;
};

export const getMyAttributes = async () => {
  const response = await api.get("/abe/my-attributes");
  return response.data;
};

export const getAllFiles = async () => {
  const response = await api.get("/abe/list");
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get("/abe/admin/users");
  return response.data;
};

export const getCatalog = async () => {
  const response = await api.get("/abe/attributes");
  return response.data;
};

export const addCatalogAttr = async (name: string) => {
  const response = await api.post("/abe/admin/attributes", {
    name: name,
    description: "Added via Admin Panel",
  });
  return response.data;
};

export const assignUserAttrs = async (userId: number, attributes: string) => {
  const response = await api.post("/abe/admin/assign-attributes", {
    targetUserId: userId,
    attributes: attributes,
  });
  return response.data;
};

export const uploadAndEncryptFile = async (
  file: File,
  selectedTags: string,
  base64Key: string,
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("selectedTags", selectedTags);
  formData.append("key", base64Key);
  const response = await api.post("/abe/encrypt-file", formData);
  return response.data;
};

export const downloadFile = async (fileId: string | number) => {
  const response = await api.get(`/abe/download/${fileId}`, {
    responseType: "blob",
  });

  return response;
};

export const deleteFile = async (fileId: string | number) => {
  const response = await api.delete(`/abe/delete/${fileId}`);
  return response.data;
};

export const createSubAdmin = async (userData: any) => {
  const response = await api.post("/abe/admin/subadmin", userData);
  return response.data;
};

export const deleteCatalogAttr = async (id: number) => {
  const response = await api.delete(`/abe/admin/attributes/${id}`);
  return response.data;
};
