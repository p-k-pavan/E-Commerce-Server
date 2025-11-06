import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

cloudinary.config({
  cloud_name: process.env.CLODINARY_CLOUD_NAME,
  api_key: process.env.CLODINARY_API_KEY,
  api_secret: process.env.CLODINARY_API_SECRET_KEY,
});

const uploadToCloudinary = async (file: Express.Multer.File) => {
  if (!file) throw new Error("No file provided");

  // Resize before uploading
  const resizedBuffer = await sharp(file.buffer)
    .resize({ width: 800, height: 600 })
    .toBuffer();

  // Use original file name as public_id (upload with order)
  const fileName = file.originalname.split(".")[0]; // remove extension

  // Upload stream
  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "E-Commerce",
        public_id: fileName,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
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
