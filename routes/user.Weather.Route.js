import express from "express";
import {
  currentCity,
  getCurrentCity,
  addMultiplePlaces,
  getMultiplePlaces,
  deleteMultiplePlaces,
} from "../controller/controller.js";
import { userAuthenticate } from "../middleware/userAuth.Middleware.js";

const router = express.Router();

router.post("/current-weather/add", userAuthenticate, currentCity);
router.get("/current-weather/get", userAuthenticate, getCurrentCity);
router.post("/multiple-weather/add", userAuthenticate, addMultiplePlaces);
router.get("/multiple-weather/get", userAuthenticate, getMultiplePlaces);
router.delete("/multiple-weather/delete/:placeId", userAuthenticate, deleteMultiplePlaces);
export default router;
