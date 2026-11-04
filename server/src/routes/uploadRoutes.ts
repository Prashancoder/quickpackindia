import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(sanitizedName) || ".jpg";
    const baseName = path.basename(sanitizedName, ext).substring(0, 30);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// Allowed Image Formats
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/avif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, WEBP, GIF, and SVG images are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Middleware to handle single upload with fallback fields
const singleUploadMiddleware = (req: Request, res: Response, next: any) => {
  const uploadSingle = upload.any();
  uploadSingle(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message || "Failed to upload file." });
    }
    next();
  });
};

/**
 * @route POST /api/upload
 * @desc  Upload a single image
 */
router.post("/", singleUploadMiddleware, (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    const file = req.file || (files && files.length > 0 ? files[0] : null);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided for upload.",
      });
    }

    const publicUrl = `/uploads/${file.filename}`;

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully!",
      url: publicUrl,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during file upload.",
    });
  }
});

/**
 * @route POST /api/upload/multiple
 * @desc  Upload multiple images
 */
router.post("/multiple", singleUploadMiddleware, (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided for upload.",
      });
    }

    const uploadedFiles = files.map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

    return res.status(200).json({
      success: true,
      message: `${files.length} images uploaded successfully!`,
      files: uploadedFiles,
      urls: uploadedFiles.map((f) => f.url),
    });
  } catch (error: any) {
    console.error("Multiple Upload Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during multiple file upload.",
    });
  }
});

export default router;
