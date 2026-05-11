
"use client";

import { api } from "@/lib/api";

export async function loginUser(data: any) {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error: any) {
    return {
      error: error.response?.data?.message || "Login failed. Please check your credentials.",
    };
  }
}
