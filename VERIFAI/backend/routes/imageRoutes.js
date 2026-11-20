
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

// Store uploaded image temporarily in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed."));
        }
    }
});

// AI Image Detection
router.post("/detect", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image."
            });
        }

        const apiUser = process.env.SIGHTENGINE_API_USER;
        const apiSecret = process.env.SIGHTENGINE_API_SECRET;

        if (!apiUser || !apiSecret) {
            return res.status(500).json({
                success: false,
                message: "Sightengine API credentials are missing."
            });
        }

        const form = new FormData();

        form.append("media", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        form.append("models", "genai");
        form.append("api_user", apiUser);
        form.append("api_secret", apiSecret);

        const response = await axios.post(
            "https://api.sightengine.com/1.0/check.json",
            form,
            {
                headers: form.getHeaders(),
                maxBodyLength: Infinity,
                timeout: 60000
            }
        );

        const result = response.data;

        if (result.status !== "success") {
            return res.status(502).json({
                success: false,
                message: "Image analysis failed."
            });
        }

        const score = result.type?.ai_generated;

        if (typeof score !== "number") {
            return res.status(502).json({
                success: false,
                message: "AI detection score was not returned."
            });
        }

        res.json({
            success: true,
            message: "Image analyzed successfully.",
            fileName: req.file.originalname,
            aiGeneratedScore: score,
            aiGeneratedPercentage: Math.round(score * 100),
            resultId: result.request?.id
        });

    } catch (error) {
        console.error(
            "Image Detection Error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to analyze image. Please try again."
        });
    }
});

module.exports = router;
