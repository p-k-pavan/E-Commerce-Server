import cloudinary from "../config/cloudinary";

interface SaveImagesOptions {
  folder: string;
}

export const uploadImagesToCloudinary = async (
  files: Express.Multer.File[],
  options: SaveImagesOptions
): Promise<string[]> => {
  const { folder } = options;

  const imageUrls: string[] = [];

  for (const file of files) {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
            format: "webp",
            quality: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(file.buffer);
    });

    imageUrls.push(result.secure_url);
  }

  return imageUrls;
};