import express from "express";
import upload from "../middleware/multer";
import uploadImageController from "../controllers/uploadImage.controller";
import VerifyToken from "../middleware/VerifyToken";


const router = express.Router();


// POST /api/upload
router.post("/upload",VerifyToken ,upload.array("file"), uploadImageController);

export default router;
