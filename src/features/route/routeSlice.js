import { createSlice } from '@reduxjs/toolkit';
import { STOPS } from './routeData';

const DELIVERY_COUNT = STOPS.length - 1;

const initialState = {
  distance: 0, // live location - units from origin
  status: 'idle', 
  isPaused: false, 
  completedCount: 0, 
  speed: 1, // --- user preference ---
  geometry: {
    segmentLengths: [],
    stopDistances: [],
    total: 0,
    measured: false,
  },
  elapsed: 0,
};

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    geometryMeasured(state, action) {
      const { segmentLengths, stopDistances, total } = action.payload;
      state.geometry = { segmentLengths, stopDistances, total, measured: true };
    },

    started(state) {
      if (state.status === 'complete') return;
      state.status = 'moving';
      state.isPaused = false;
    },

    pauseToggled(state) {
      if (state.status === 'idle' || state.status === 'complete') return;
      state.isPaused = !state.isPaused;
    },

    
    distanceAdvanced(state, action) {
      state.distance = action.payload.distance;
      state.elapsed = action.payload.elapsed;
    },

    arrivedAtStop(state) {
      state.distance = state.geometry.stopDistances[state.completedCount];
      state.status = 'delivering';
    },

    deliveryFinished(state) {
      state.completedCount += 1;
      state.status =
        state.completedCount >= DELIVERY_COUNT ? 'complete' : 'moving';
    },

    speedChanged(state, action) {
      state.speed = action.payload;
    },

    reset(state) {
      state.distance = 0;
      state.status = 'idle';
      state.isPaused = false;
      state.completedCount = 0;
      state.elapsed = 0;
    },
  },
});

export const {
  geometryMeasured,
  started,
  pauseToggled,
  distanceAdvanced,
  arrivedAtStop,
  deliveryFinished,
  speedChanged,
  reset,
} = routeSlice.actions;

export default routeSlice.reducer;