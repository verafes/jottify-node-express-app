const express = require("express");
const multer  = require('multer')
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();
const {
    getAllStories,
    getStoryById,
    createStory,
    updateStory,
    deleteStory,
    uploadStoryImage,
} = require("../controllers/stories");

router.route("/").post(createStory).get(getAllStories);
router
    .route("/:id")
    .get(getStoryById)
    .patch(updateStory)
    .delete(deleteStory);

router.post('/upload', upload.single('image'), uploadStoryImage);

module.exports = router;
