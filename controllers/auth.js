const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const register = async (req, res) => {
  try {
    const user = await User.create({ ...req.body });
    const token = user.createJWT();
    res
      .status(StatusCodes.CREATED)
      .json({ user: { name: user.getName() }, token });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestError("Please provide email and password");
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthenticatedError("Invalid Credentials");
    }
    // compare the password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError("Wrong password");
    }
    const token = user.createJWT();
    res.status(StatusCodes.OK).json({ user: { name: user.getName() }, token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

module.exports = {
  register,
  login,
};