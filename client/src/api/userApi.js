import { api } from "./axios";

export async function updateUserProfile(payload) {
  const { data } = await api.patch("/users/profile", payload);
  return data.user;
}

export async function updateUserAvatar(formData) {
  const { data } = await api.patch("/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data.user;
}

