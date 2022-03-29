const express = require("express");
const CreateError = require("http-errors");
const Joi = require("joi");

const contactsOperations = require("../../models/contacts");

const contactSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .pattern(/^[a-zA-Z ]+$/)
    .required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]+-[0-9]+-[0-9]+$/, "numbers")
    .required(),
});

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const contacts = await contactsOperations.listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId: id } = req.params;
    const contact = await contactsOperations.getContactById(id);
    if (!contact) {
      throw new CreateError(404, "Not found");
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      throw new CreateError(400, error.message);
    }
    const body = req.body;
    const newContact = await contactsOperations.addContact(body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId: id } = req.params;
    const contact = await contactsOperations.removeContact(id);
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
    const { error } = contactSchema.validate(req.body);
    if (error) {
      throw new CreateError(400, error.message);
    }
    const body = req.body;
    const { contactId: id } = req.params;
    const contact = await contactsOperations.updateContact(id, body);
    if (!contact) {
      throw new CreateError(404, "Not found");
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
