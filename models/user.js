const { Schema, model } = require("mongoose");
const Joi = require("joi");

const emailRegexp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/;
const userSchema = Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: emailRegexp,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Min 6 symbols. There are {VALUE}"],
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: "",
    },
  },
  { versionKey: false, timestamps: true }
);

const registerJoiSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const User = model("user", userSchema);

const schemas = {
  register: registerJoiSchema,
};

module.exports = {
  User,
  schemas,
};
