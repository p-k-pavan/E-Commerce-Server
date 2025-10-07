import { Request, Response } from "express";
import uploadToCloudinary from "../utils/uploadImageClodinary";

interface UploadImageResponse {
  message: string;
  data?: string[];
  success: boolean;
  error: boolean;
}

interface ErrorResponse {
  message: string;
  error: boolean;
  success: boolean;
}

const uploadImageController = async (
  req: Request,
  res: Response
): Promise<Response<UploadImageResponse | ErrorResponse>> => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "No files uploaded",
        success: false,
        error: true,
      });
    }

    if(files.length > 5){
      return res.status(400).json({
        message: "Maximum 5 files can be uploaded at once",
        success: false,
        error: true,
      });
    }

    // Upload each file to Cloudinary
    const uploadPromises = files.map((file) => uploadToCloudinary(file));
    const uploadedUrls = await Promise.all(uploadPromises);

    return res.json({
      message: "All files uploaded successfully",
      data: uploadedUrls,
      success: true,
      error: false,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};

export default uploadImageController;
