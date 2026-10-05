import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: "checking" | "authenticated" | "unauthenticated"
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
  token: string
  user: User
}

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async () => {
    const refreshResponse = await fetch(
      "http://localhost:5000/api/auth/refresh",
      {
        method: "POST",
        credentials: "include",
      }
    )

    if (!refreshResponse.ok) {
      throw new Error("Session could not be restored")
    }

    const refreshData: { token: string } =
      await refreshResponse.json()

    const meResponse = await fetch(
      "http://localhost:5000/api/auth/me",
      {
        headers: {
          Authorization: `Bearer ${refreshData.token}`,
        },
      }
    )

    if (!meResponse.ok) {
      throw new Error("Could not fetch current user")
    }

    const meData: { user: User } = await meResponse.json()

    return {
      token: refreshData.token,
      user: meData.user,
    } satisfies RestoreSessionResponse
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    login(state, action: PayloadAction<LoginPayload>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = 'authenticated'
    },

    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "unauthenticated"
    },

    updateUser(state, action: PayloadAction<User>) {
  state.user = action.payload
}
  },

  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.status = "checking"
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.status = "authenticated"
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null
        state.token = null
        state.status = "unauthenticated"
      })
  },
});

export const { login, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;
