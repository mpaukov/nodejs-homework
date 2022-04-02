const express = require("express");
const CreateError = require("http-errors");

const { Contact, schemas } = require("../../models/contact");
const { authenticate } = require("../../middlewares");

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { _id } = req.user;
    const skip = (page - 1) * limit;
    const contacts = await Contact.find(
      { owner: _id },
      "-createdAt -updatedAt",
      { skip, limit: +limit }
    ).populate("owner", "email");
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId: id } = req.params;
    const contact = await Contact.findById(id, "-createdAt -updatedAt");

    if (!contact) {
      throw new CreateError(404, "Not found");
    }
    res.json(contact);
  } catch (error) {
    if (error.message.includes("ObjectId failed for value")) {
      error.status = 404;
      error.message = "Not found";
    }
    next(error);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { error } = schemas.add.validate(req.body);
    if (error) {
      throw new CreateError(400, error.message);
    }
    const data = { ...req.body, owner: req.user._id };
    const newContact = await Contact.create(data);
    res.status(201).json(newContact);
  } catch (error) {
    if (
      error.message.includes("validation failed") ||
      error.message.includes("duplicate key error")
    ) {
      error.status = 400;
    }
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId: id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      throw new CreateError(404, "Not found");
    }
    res.json({ message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const { error } = schemas.add.validate(req.body);
    if (error) {
      throw new CreateError(400, error.message);
    }
    const { contactId: id } = req.params;
    const contact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!contact) {
      throw new CreateError(404, "Not found");
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  try {
    const { error } = schemas.updateFavorite.validate(req.body);
    if (error) {
      throw new CreateError(400, "Missing field favorite");
    }

    const { contactId: id } = req.params;
    const contact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!contact) {
      throw new CreateError(404, "Not found");
    }
    res.json(contact);
  } catch (error) {
    if (error.message.includes("ObjectId failed for value")) {
      error.status = 404;
      error.message = "Not found";
    }
    next(error);
  }
});

module.exports = router;
