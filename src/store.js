import { configureStore } from '@reduxjs/toolkit';
import routeReducer from './features/route/routeSlice';

export const store = configureStore({
  reducer: { route: routeReducer },
});