const express = require("express");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const CreateError = require("http-errors");

const { sendEmail } = require("../../helpers");

const { User, schemas } = require("../../models/user");
const { authenticate, upload } = require("../../middlewares");

const router = express.Router();

router.get(
  "/verify/:verificationToken",

  async (req, res, next) => {
    try {
      const { verificationToken } = req.params;
      const user = await User.findOne({ verificationToken });

      if (!user) {
        throw new CreateError(404, "User not found");
      }

      await User.findByIdAndUpdate(user._id, {
        verify: true,
        verificationToken: "",
      });

      res.json({
        message: "Verification successful",
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/verify", async (req, res, next) => {
  try {
    const { error } = schemas.verify.validate(req.body);
    if (error) {
      throw new CreateError(400, "Missing required field email");
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user.verify) {
      throw CreateError(400, "Verification has already been passed");
    }
    const mail = {
      to: email,
      subject: "Confirm email",
      html: `<a target='_blank' href='http://localhost:4000/api/users/verify/${user.verificationToken}'>Press to confirm email</a>`,
    };
    await sendEmail(mail);
    res.json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
});

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
      const normalizedAvatar = await Jimp.read(resultUpload);
      normalizedAvatar.resize(250, 250).write(resultUpload);
      const avatarURL = path.join("avatars", newFileName);
      await User.findByIdAndUpdate(_id, { avatarURL });
      res.json({ avatarURL });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
