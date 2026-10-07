import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "../../api/client";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin";
  profileImage?: string | null;
}

interface AdminAuthState {
  user: AdminUser | null;
  token: string | null;
  status: "checking" | "authenticated" | "unauthenticated";
}

interface AdminLoginPayload {
  user: AdminUser;
  token: string;
}

interface AdminMeResponse {
  user: AdminUser;
}

export const restoreAdminSession = createAsyncThunk(
  "adminAuth/restoreAdminSession",
  async () => {
    const refreshResponse = await api.post<{ token: string }>(
      "/api/admin/refresh",
    );

    const refreshData = refreshResponse.data;

    const meResponse = await api.get<AdminMeResponse>("/api/admin/me", {
      headers: {
        Authorization: `Bearer ${refreshData.token}`,
      },
    });

    const meData = meResponse.data;

    if (meData.user.role !== "admin") {
      throw new Error("Admin access required");
    }

    return {
      token: refreshData.token,
      user: meData.user,
    };
  },
);

const initialState: AdminAuthState = {
  user: null,
  token: null,
  status: "checking",
};

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,

  reducers: {
    loginAdmin(state, action: PayloadAction<AdminLoginPayload>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = "authenticated";
    },

    logoutAdmin(state) {
      state.user = null;
      state.token = null;
      state.status = "unauthenticated";
    },

    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(restoreAdminSession.pending, (state) => {
        state.status = "checking";
      })
      .addCase(restoreAdminSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.status = "authenticated";
      })
      .addCase(restoreAdminSession.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.status = "unauthenticated";
      });
  },
});

export const { loginAdmin, logoutAdmin, setToken } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
