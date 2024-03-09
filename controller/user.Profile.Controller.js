import { userModel } from "../model/model.js";
import cloudinary from "../cloudinary/cloudinary.js";
import { hashPassword, comparePassword } from "../helpers/auth.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const accessTokenSecretUser = process.env.USER_JWT_SECRET;
const refreshTokenSecretUser = process.env.USER_REFRESH_TOKEN_SECRET;
dotenv.config();

//USER AUTHENTICATION
// ----------------------------------------------------------------------------

//POST: user registration endpoint
const userRegister = async (req, res, next) => {
  try {
    const { name, mobile, email, password } = req.body;

    console.log(name, mobile, email, password);
    if (!name) {
      return res.json({ message: "name is required" });
    }
    if (!mobile || mobile.length !== 10) {
      return res.json({ message: "mobile is required" });
    }
    if (!email) {
      return res.json({ message: "email is required" });
    }
    if (!password || password.length < 6) {
      return res.json({
        message: "password is required and should be at least 6 characters",
      });
    }

    //check if mobile already registered
    const existMobile = await userModel.findOne({ mobile });
    if (existMobile) {
      return res.json({ message: "mobile already exists" });
    }
    //check if email already registered
    const existEmail = await userModel.findOne({ email });
    if (existEmail) {
      return res.json({ message: "email already registered" });
    }

    // hash the new password
    const hashedPassword = await hashPassword(password);

    //save to the database
    const user = await userModel.create({
      name,
      mobile,
      email,
      password: hashedPassword,
    });

    return res
      .status(200)
      .json({ user, message: "user registered successfully" });
  } catch (error) {
    next(error);
    console.log(error, "user registration failed");
    return res.status(500).json({ message: "Internal server error" });
  }
};

//POST: user login endpoint
const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.json({ message: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.json({
        message: "Password is required and should be at least 6 characters",
      });
    }

    // Check if email already registered
    const existingUser = await userModel.findOne({ email }).maxTimeMS(20000);

    if (!existingUser) {
      return res.json({ message: "User not found" });
    }

    // Check if the user's account is unblocked
    if (existingUser.allow !== "unblock") {
      return res.json({
        message: "Your account is blocked. Please contact the admin.",
      });
    }

    // Check if the password matches
    const passwordMatch = await comparePassword(
      password,
      existingUser.password
    );

    if (!passwordMatch) {
      return res.json({ message: "Invalid password" });
    }

    // Generate ACCESS TOKEN
    const accessTokenUser = jwt.sign(
      {
        name: existingUser.name,
        id: existingUser._id,
        email: existingUser.email,
        role: "user",
      },
      accessTokenSecretUser,
      { expiresIn: "1h" }
    );

    // Generate REFRESH TOKEN
    const refreshTokenUser = jwt.sign(
      {
        id: existingUser._id,
        role: "user",
      },
      refreshTokenSecretUser,
      { expiresIn: "30d" }
    );

    // Set the token as cookies in the response
    res.cookie("accessTokenUser", accessTokenUser, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      path: "/",
    });
    res.cookie("refreshTokenUser", refreshTokenUser, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      path: "/",
    });

    return res.status(200).json({
      message: "User Login successful",
      _id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      accessTokenUser: accessTokenUser,
      refreshTokenUser: refreshTokenUser,
    });
  } catch (error) {
    next(error);
    console.error(error, "login failed");
    return res.status(500).json({ message: "Internal server error" });
  }
};

//USER PROFILE MANAGEMENT
// ------------------------------------------------------------------------------

//GET: get user profile endpoint
const userProfile = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    //check if user exists
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(200).json(existingUser);
    }
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//PUT: update user profile endpoint
const updateUserProfile = async (req, res, next) => {
  try {
    const {
      newName,
      newMobile,
      newEmail,
      newPassword,
      oldPassword,
      confirmPassword,
    } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    //check if user exists
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    } else {
      //validate old password
      const isPasswordCorrect = await comparePassword(
        oldPassword,
        existingUser.password
      );
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Invalid password" });
      }
    }

    //validate new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "new password and confirm password do not match" });
    }

    //hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    //update the new details in the database
    existingUser.name = newName || existingUser.name;
    existingUser.mobile = newMobile || existingUser.mobile;
    existingUser.email = newEmail || existingUser.email;
    existingUser.password = hashedNewPassword;

    //save the data to the database
    await existingUser.save();

    return res
      .status(200)
      .json({ message: "User profile updated successfully" });
  } catch (error) {
    next(error);
    console.log(error, "error updating user details");
    return res.status(500).json({ message: "Internal server error" });
  }
};

//USER PROFILE PHOTO UPLOAD
// ----------------------------------------------------------------------------

// POST: add user profile photo endpoint
const addUserProfilePhoto = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Invalid file upload" });
    }

    // Check if user exists
    const existingUser = await userModel.findById(userId);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upload image to cloudinary
    const { secure_url } = await cloudinary.v2.uploader.upload(req.file.path);

    // Check if there is an existing image for the user
    if (existingUser.image) {
      // If an existing image is found, delete it from Cloudinary
      if (existingUser.image.public_id) {
        await cloudinary.v2.uploader.destroy(existingUser.image.public_id);
      }
    }

    // Update the user's image path in the database
    existingUser.image = secure_url;

    // Save the data to the database
    await existingUser.save();

    res.status(201).json({
      message: "Profile photo uploaded successfully",
      image: secure_url,
    });
  } catch (error) {
    console.error("Error adding profile photo:", error);
    next(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST: logout user endpoint
const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("accessTokenUser");
    res.clearCookie("refreshTokenUser");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
    console.error(error, "logout failed");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  userRegister,
  userLogin,
  userProfile,
  updateUserProfile,
  addUserProfilePhoto,
  logoutUser,
};
