import { createStore } from "redux";
import { applyMiddleware } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";

const middleware = [thunk];
const initState = {};

const store = createStore(
  rootReducer,
  initState,
  applyMiddleware(...middleware)
);

export default store;
