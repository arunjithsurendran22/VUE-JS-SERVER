import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  allow: {
    type: String,
    default: "unblock",
  },
  name: {
    type: String,
  },
  mobile: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  image: {
    type: String,
  },
  currentCity: {
    type: String,
    default: "Delhi",
  },
  multiplePlace: [
    {
      name: {
        type: String,
      },
    },
  ],
});

const userModel = mongoose.model("user", userSchema);

export default userModel;
