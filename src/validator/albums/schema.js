const Joi = require('joi');

const currentYear = new Date().getFullYear();

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(currentYear)
    .required(),
});

const AlbumLikesPayloadSchema = Joi.object({
  albumId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { AlbumPayloadSchema, AlbumLikesPayloadSchema };
