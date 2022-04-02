const { Schema, model } = require("mongoose");
const Joi = require("joi");

const codeRegexp = /^\(\d{3}\)\s\d{3}-\d{4}$/;

const contactSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
      minlength: [3, "Must be at least 3, got {VALUE}"],
      match: /^[a-zA-Z ]+$/,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "User email required"],
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "User phone number required"],
      match: [codeRegexp, "Must be in format (000) 000-0000"],
      unique: true,
      trim: true,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
);

const joiAddContactSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .pattern(/^[a-zA-Z ]+$/)
    .required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(codeRegexp, "numbers").required(),
  favorite: Joi.boolean(),
});

const joiUpdateContactFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const Contact = model("contact", contactSchema);

module.exports = {
  Contact,
  schemas: {
    add: joiAddContactSchema,
    updateFavorite: joiUpdateContactFavoriteSchema,
  },
};
