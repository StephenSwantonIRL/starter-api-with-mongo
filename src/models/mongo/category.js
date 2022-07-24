import Mongoose from "mongoose";

const { Schema } = Mongoose;

const categorySchema = new Schema({
  name: String,
  places: [{
    type: Schema.Types.ObjectId,
    ref: "Place",
  }],
});

export const Category = Mongoose.model("Category", categorySchema);
