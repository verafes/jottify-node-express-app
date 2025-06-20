const express = require("express");
const router = express.Router();
const {
    getAllStories,
    getStoryById,
    createStory,
    updateStory,
    deleteStory,
} = require("../controllers/stories");

router.route("/").post(createStory).get(getAllStories);
router
    .route("/:id")
    .get(getStoryById)
    .patch(updateStory)
    .delete(deleteStory);

module.exports = router;
