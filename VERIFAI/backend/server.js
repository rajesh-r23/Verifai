
const express = require("express");
const cors = require("cors");
require("dotenv").config({
    path: require("path").join(__dirname, ".env")
});
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const imageRoutes = require("./routes/imageRoutes");
const textRoutes = require("./routes/textRoutes");

// Connect API route
app.use("/api/images", imageRoutes);
app.use("/api/text", textRoutes);

// Backend health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "VERIFAI Backend is running!"
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.message);

    res.status(400).json({
        success: false,
        message: err.message || "Something went wrong."
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`VERIFAI server running on port ${PORT}`);
});

console.log("VERIFAI ENV CHECK:", {
    apiUserLoaded: !!process.env.SIGHTENGINE_API_USER,
    apiSecretLoaded: !!process.env.SIGHTENGINE_API_SECRET
});
