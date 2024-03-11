import { userModel } from "../model/model.js";

// POST: Save current user search city
const currentCity = async (req, res, next) => {
  try {
    const userId = req.userId;
    const currentCityName = req.body.currentCity; // Assuming you're sending the city name in the request body

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    existingUser.currentCity = currentCityName; // Assign the current city to the user

    await existingUser.save(); // Save the user with updated current city

    res
      .status(200)
      .json({ message: "Current city saved successfully", user: existingUser });
  } catch (error) {
    next(error);
    console.error("Failed to add city:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET: Get current user's search city
const getCurrentCity = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentCity = existingUser.currentCity;

    res.status(200).json({ currentCity });
  } catch (error) {
    next(error);
    console.error("Failed to get current city:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST: Save multiple places for user
const addMultiplePlaces = async (req, res, next) => {
  try {
    const userId = req.userId;
    const placeName = req.body.newPlace; 

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new place object
    const newPlace = { name: placeName };

    // Push the new place object into the multiplePlace array
    existingUser.multiplePlace.push(newPlace);

    await existingUser.save(); // Save the user with updated multiple places

    res.status(200).json({
      message: "Multiple places saved successfully",
      user: existingUser,
    });
  } catch (error) {
    next(error);
    console.error("Failed to add multiple places:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET: Get multiple places for user
const getMultiplePlaces = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const multiplePlaces = existingUser.multiplePlace

    res.status(200).json({ multiplePlaces });
  } catch (error) {
    next(error);
    console.error("Failed to get multiple places:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE: Delete a place for user
const deleteMultiplePlaces = async (req, res, next) => {
  try {
    const userId = req.userId;
    const placeId = req.params.placeId;


    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the place to be deleted
    const indexToDelete = existingUser.multiplePlace.findIndex(
      (place) => place._id.toString() === placeId
    );
    if (indexToDelete === -1) {
      return res.status(404).json({ message: "Place not found for this user" });
    }

    // Remove the place from the multiplePlace array
    existingUser.multiplePlace.splice(indexToDelete, 1);

    await existingUser.save(); // Save the user with updated multiple places

    res.status(200).json({
      message: "Place deleted successfully",
      user: existingUser,
    });
  } catch (error) {
    next(error);
    console.error("Failed to delete place:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  currentCity,
  getCurrentCity,
  addMultiplePlaces,
  getMultiplePlaces,
  deleteMultiplePlaces,
};
