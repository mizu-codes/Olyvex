import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface AdminUser {
  id: string
  name: string
  email: string
  role: "admin"
  profileImage?: string | null
}

interface AdminAuthState {
  user: AdminUser | null
  token: string | null
  status: "checking" | "authenticated" | "unauthenticated"
}

interface AdminLoginPayload {
  user: AdminUser
  token: string
}

interface AdminMeResponse {
  user: AdminUser
}

export const restoreAdminSession = createAsyncThunk(
  "adminAuth/restoreAdminSession",
  async () => {
    const refreshResponse = await fetch(
      "http://localhost:5000/api/admin/refresh",
      {
        method: "POST",
        credentials: "include",
      }
    )

    if (!refreshResponse.ok) {
      throw new Error("Admin session could not be restored")
    }

    const refreshData: { token: string } =
      await refreshResponse.json()

    const meResponse = await fetch(
      "http://localhost:5000/api/admin/me",
      {
        headers: {
          Authorization: `Bearer ${refreshData.token}`,
        },
      }
    )

    if (!meResponse.ok) {
      throw new Error("Could not fetch admin user")
    }

    const meData: AdminMeResponse = await meResponse.json()

    if (meData.user.role !== "admin") {
      throw new Error("Admin access required")
    }

    return {
      token: refreshData.token,
      user: meData.user,
    }
  }
)

const initialState: AdminAuthState = {
  user: null,
  token: null,
  status: "checking",
}

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,

  reducers: {
    loginAdmin(
      state,
      action: PayloadAction<AdminLoginPayload>
    ) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.status = "authenticated"
    },

    logoutAdmin(state) {
      state.user = null
      state.token = null
      state.status = "unauthenticated"
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(restoreAdminSession.pending, (state) => {
        state.status = "checking"
      })
      .addCase(
        restoreAdminSession.fulfilled,
        (state, action) => {
          state.user = action.payload.user
          state.token = action.payload.token
          state.status = "authenticated"
        }
      )
      .addCase(
        restoreAdminSession.rejected,
        (state) => {
          state.user = null
          state.token = null
          state.status = "unauthenticated"
        }
      )
  },
})

export const { loginAdmin, logoutAdmin } =
  adminAuthSlice.actions

export default adminAuthSlice.reducer