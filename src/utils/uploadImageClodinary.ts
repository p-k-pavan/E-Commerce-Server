import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

cloudinary.config({
  cloud_name: process.env.CLODINARY_CLOUD_NAME,
  api_key: process.env.CLODINARY_API_KEY,
  api_secret: process.env.CLODINARY_API_SECRET_KEY,
});

const uploadToCloudinary = async (file: Express.Multer.File) => {
  if (!file) throw new Error("No file provided");

  // Resize image before uploading
  const resizedBuffer = await sharp(file.buffer)
    .resize({ width: 800, height: 600 })
    .toBuffer();

  // Upload to Cloudinary
  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "E-Commerce", 
      },
      (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error("Upload failed"));
        resolve(result.secure_url);
      }
    );

    uploadStream.end(resizedBuffer);
  });
};

export default uploadToCloudinary;
