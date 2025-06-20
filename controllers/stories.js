const Story = require("../models/Story");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllStories = async (req, res) => {
  const stories = await Story.find({ createdBy: req.user.userId }).sort(
    "createdAt"
  );
  res.status(StatusCodes.OK).json({ stories, count: stories.length });
};

const getStoryById = async (req, res) => {
  const {
    user: { userId },
    params: { id: storyId },
  } = req;
  const story = await Story.findOne({
    _id: storyId,
    createdBy: userId,
  });
  if (!story) {
    throw new NotFoundError(`No story with id: ${storyId}`);
  }
  res.status(StatusCodes.OK).json({ story });
};

const createStory = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const story = await Story.create({ ...req.body });
  res.status(StatusCodes.CREATED).json({ story });
};

const updateStory = async (req, res) => {
  const {
    body: { title, description, tags, isFavorite, imageUrl, storyDate },
    user: { userId },
    params: { id: storyId },
  } = req;
  
  if (!title || !description ) {
    throw new BadRequestError("Please provide title and description");
  }
  
  req.body.description = req.body.description.trim();
  
  const story = await Story.findOneAndUpdate(
    { _id: storyId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!story) {
    throw new NotFoundError(`No story with id: ${storyId}`);
  }
  res.status(StatusCodes.OK).json({ story });
};

const deleteStory = async (req, res) => {
  const {
    user: { userId },
    params: { id: storyId },
  } = req;
  
  const story = await Story.findOneAndRemove({
    _id: storyId,
    createdBy: userId,
  });
  if (!story) {
    throw new NotFoundError(`No story with id: ${storyId}`);
  }
  res
    .status(StatusCodes.OK)
    .json({ msg: "Story has been successfully deleted" });
};

module.exports = {
  getAllStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
};