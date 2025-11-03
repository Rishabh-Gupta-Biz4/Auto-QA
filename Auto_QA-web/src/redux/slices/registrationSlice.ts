import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PendingRegistration {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface RegistrationState {
  pendingRegistration: PendingRegistration | null;
}

const initialState: RegistrationState = {
  pendingRegistration: null,
};

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    setPendingRegistration: (state, action: PayloadAction<PendingRegistration>) => {
      state.pendingRegistration = action.payload;
    },
    clearPendingRegistration: (state) => {
      state.pendingRegistration = null;
    },
    initializeRegistration: (state, action: PayloadAction<RegistrationState>) => {
      state.pendingRegistration = action.payload.pendingRegistration;
    },
  },
});

export const { setPendingRegistration, clearPendingRegistration, initializeRegistration } = registrationSlice.actions;
export default registrationSlice.reducer;




