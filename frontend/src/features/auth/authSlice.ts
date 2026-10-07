import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "../../api/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  profileImage?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: "checking" | "authenticated" | "unauthenticated";
}

interface LoginPayload {
  user: User;
  token: string;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: "checking",
};

interface RestoreSessionResponse {
  token: string;
  user: User;
}

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async () => {
    const refreshResponse = await api.post<{ token: string }>(
      "/api/auth/refresh",
    );

    const refreshData = refreshResponse.data;

    const meResponse = await api.get<{ user: User }>("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${refreshData.token}`,
      },
    });

    const meData = meResponse.data;

    return {
      token: refreshData.token,
      user: meData.user,
    } satisfies RestoreSessionResponse;
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    login(state, action: PayloadAction<LoginPayload>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = "authenticated";
    },

    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "unauthenticated";
    },

    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },

    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.status = "checking";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.status = "authenticated";
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.status = "unauthenticated";
      });
  },
});

export const { login, logout, updateUser, setToken } = authSlice.actions;

export default authSlice.reducer;
