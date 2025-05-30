const Joi = require('joi');

const id = Joi.string().uuid();
const name = Joi.string.alphanum().min(3).max(15);
const price = Joi.number().integer().min(10);

const createProductSchema = Joi.object({
  name: name.required(),
  price: price.required()
})

const updateProductosSchema = Joi.object({
  name: name(),
  price: price()
})

const getProductosSchema = Joi.object({
  id: id.required(),
})

const deleteProductosSchema = Joi.object({
  id: id.required(),
})

module.exports = {createProductSchema, updateProductosSchema, getProductosSchema, deleteProductosSchema}
