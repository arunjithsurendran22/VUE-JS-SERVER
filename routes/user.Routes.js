import express from "express";
import userProfileRoute from "./user.Profile.Route.js";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/user/profile",
    route: userProfileRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
