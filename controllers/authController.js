import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

// @desc Login
// @route POST /auth
// @access Public
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const foundUser = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .exec();

  if (!foundUser) {
    return res.status(401).json({ message: "User doesn't exist" });
  }

  if(!foundUser.active) {
    return res.status(401).json({message: "User is deactivated"})
  }

  const isMatch = await bcrypt.compare(password, foundUser.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Password is incorrect." });
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only from web server
    secure: true,
    sameSite: "None", // cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //7days
  });

  res.json({ accessToken });
});

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
export const refresh = (req, res) => {
  const cookie = req.cookies;
  console.log("cookie: ", cookie)
  if (!cookie?.jwt) return res.status(401).json({ message: "Unauthorized." });

  const refreshToken = cookie.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden. refresh token expired" });

      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();
      if (!foundUser) {
        console.log("No user found for decoded token: ", decoded);
        return res.status(401).json({ message: "Unauthorized. no user" });
      }
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    })
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public - because it is to clear cookies if it exists.
export const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.jwt) return res.sendStatus(204);
  //pass the same options that was passed when the cookie was created except maxAge because it is not needed
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res.json({ message: "Cookie Cleared" });
});
