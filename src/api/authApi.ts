import { post, postFormData, patchFormData, tryRefresh } from "./client";
import type { ApiUser, ApiSigninResponse } from "../types/api";

// ── Auth ─────────────────────────────────────

/** Registra um novo usuário (multipart/form-data para avatar) */
export async function signup(
  name: string,
  email: string,
  password: string,
  avatar?: File
): Promise<ApiUser> {
  const fd = new FormData();
  fd.append("name", name);
  fd.append("email", email);
  fd.append("password", password);
  if (avatar) fd.append("avatar", avatar);

  return postFormData<ApiUser>("/users/signup", fd);
}

/** Login — retorna user e seta cookies httpOnly */
export async function signin(
  email: string,
  password: string
): Promise<ApiSigninResponse> {
  return post<ApiSigninResponse>("/users/signin", { email, password });
}

/** Renova access token via refresh_token cookie (bypass do interceptor 401) */
export async function refresh(): Promise<boolean> {
  return tryRefresh();
}

/** Logout — revoga refresh token e limpa cookies */
export async function logout(): Promise<void> {
  await post("/users/logout");
}

/** Atualiza avatar do usuário logado */
export async function updateAvatar(avatar: File): Promise<ApiUser> {
  const fd = new FormData();
  fd.append("avatar", avatar);
  return patchFormData<ApiUser>("/users/avatar", fd);
}
