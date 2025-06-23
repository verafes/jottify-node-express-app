const streamifier = require("streamifier");
const cloudinary = require('../db/cloudinaryConfig');
const Story = require("../models/Story");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllStories = async (req, res) => {
  const { page = 1, limit = 6 } = req.query;
  const numericPage = parseInt(page, 10);
  const numericLimit = parseInt(limit, 10);
  const skip = (numericPage - 1) * numericLimit;
  
  const totalStories = await Story.countDocuments({ createdBy: req.user.userId });
  
  const stories = await Story.find({ createdBy: req.user.userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(numericLimit);
  
  const totalPages = Math.ceil(totalStories / numericLimit);
  
  res.status(StatusCodes.OK).json({
    stories,
    count: totalStories,
    totalPages,
    currentPage: numericPage,
  });
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

const uploadStoryImage = async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("No file uploaded");
  }
  const storyImage = req.file;
  if (!storyImage.mimetype.startsWith("image")) {
    throw new BadRequestError("Please upload image");
  }
  const maxSize = 1024 * 1024;
  if (storyImage.size > maxSize) {
    throw new BadRequestError("Please upload image smaller than 1MB");
  }
  
  const streamUpload = () => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });
      streamifier.createReadStream(storyImage.buffer).pipe(stream);
    });
  };
  
  try {
    const result = await streamUpload();
    res.status(StatusCodes.OK).json({ image: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
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
  uploadStoryImage,
};