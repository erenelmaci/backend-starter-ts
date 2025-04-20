import Joi from 'joi';
import CONSTANTS from '../config/constants';

export default class UserValidation {
  public static createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string(),
    role: Joi.string().valid(...Object.values(CONSTANTS.USER_ROLES)),
    profileImage: Joi.string(),
    address: Joi.string(),
    city: Joi.string(),
    country: Joi.string(),
    systemLanguage: Joi.string().valid(...Object.values(CONSTANTS.SYSTEM_LANGUAGES)),
  });

  public static updateUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string(),
    role: Joi.string().valid(...Object.values(CONSTANTS.USER_ROLES)),
    isEmailVerified: Joi.boolean(),
    profileImage: Joi.string(),
    address: Joi.string(),
    city: Joi.string(),
    country: Joi.string(),
    systemLanguage: Joi.string().valid(...Object.values(CONSTANTS.SYSTEM_LANGUAGES)),
  });

  public static idGetUserSchema = Joi.object({
    id: Joi.string().required(),
  });
}
