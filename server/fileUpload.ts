import { Router } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { sdk } from "./_core/sdk";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 16 * 1024 * 1024, // 16MB limit
  },
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // Verify user session
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Generate unique file key with random suffix to prevent enumeration
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const fileExtension = req.file.originalname.split(".").pop();
    const fileKey = `maintenance-files/${user.id}/${timestamp}-${randomSuffix}.${fileExtension}`;

    // Upload to S3
    const { url } = await storagePut(fileKey, req.file.buffer, req.file.mimetype);

    res.json({
      success: true,
      file: {
        fileKey,
        fileUrl: url,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

export default router;
