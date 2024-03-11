import express from "express";
import userProfileRoute from "./user.Profile.Route.js";
import UserWeatherRoute from './user.Weather.Route.js'
const router = express.Router();

const defaultRoutes = [
  {
    path: "/user/profile",
    route: userProfileRoute,
  },
  {
    path: "/user/weather",
    route: UserWeatherRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
