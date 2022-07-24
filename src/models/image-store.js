import * as cloudinary from "cloudinary";
import { writeFileSync } from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'temp.img')

dotenv.config();

const credentials = {
  cloud_name: process.env.cloudinary_name,
  api_key: process.env.cloudinary_key,
  api_secret: process.env.cloudinary_secret
};
cloudinary.config(credentials);

export const imageStore = {

  getAllImages: async function() {
    const result = await cloudinary.v2.api.resources();
    return result.resources;
  },

  uploadImage: async function(imagefile) {
    await writeFileSync(file, imagefile);
    const response = await cloudinary.v2.uploader.upload(file);
    return response.url;
  },

  deleteImage: async function(img) {

    const response = await cloudinary.v2.uploader.destroy(img, {});
    return response;
  }
};
