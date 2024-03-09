import express from "express";
import {
  userRegister,
  userLogin,
  userProfile,
  updateUserProfile,
  addUserProfilePhoto,
  logoutUser,
} from "../controller/controller.js";
import { userAuthenticate } from "../middleware/userAuth.Middleware.js";
import { uploading } from "../multer/multer.js";

const router = express.Router();

// User Registration and Login
router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/logout-user", logoutUser);
// User Profile Editing
router.get("/get-profile", userAuthenticate, userProfile);
router.put("/update-profile", userAuthenticate, updateUserProfile);

// Profile Photo Upload
router.post("/add-profile-photo", userAuthenticate, uploading, addUserProfilePhoto);


export default router;
