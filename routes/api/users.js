const express = require("express");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

const { User } = require("../../models/user");
const { authenticate, upload } = require("../../middlewares");

const router = express.Router();

router.get("/current", authenticate, async (req, res, next) => {
  res.json({
    email: req.user.email,
    subscription: req.user.subscription,
  });
});

router.get("/logout", authenticate, async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).send();
});

const avatarDir = path.join(__dirname, "../../", "public", "avatars");
router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  async (req, res, next) => {
    const { _id } = req.user;
    const { path: tempUpload, filename } = req.file;
    try {
      const [extension] = filename.split(".").reverse();
      const newFileName = `${_id}.${extension}`;
      const resultUpload = path.join(avatarDir, newFileName);
      await fs.rename(tempUpload, resultUpload);
      Jimp.read(resultUpload)
        .then((avatar) => {
          return avatar.resize(250, 250).write(resultUpload);
        })
        .catch(next);
      const avatarURL = path.join("avatars", newFileName);
      await User.findByIdAndUpdate(_id, { avatarURL });
      res.json({ avatarURL });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
