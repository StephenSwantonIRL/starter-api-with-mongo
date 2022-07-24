import Mongoose from "mongoose";

const { Schema } = Mongoose;

const placeSchema = new Schema({
  name: String,
  location: String,
  latitude: Number,
  longitude: Number,
  images: [String],
  description: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export const Place = Mongoose.model("Place", placeSchema);
