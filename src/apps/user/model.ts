import BaseModel, { IBaseDocument } from '../../database/BaseModel';
import CONSTANTS from '../../config/constants';

export interface IUser extends IBaseDocument {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isEmailVerified: boolean;
  profileImage: string;
  address: string;
  city: string;
  country: string;
  systemLanguage: string;
  password: string;
}

class User extends BaseModel<IUser> {
  protected name = 'User';
  protected table = 'user';
  protected searchs = ['email', 'firstName', 'lastName', 'phone'];
  protected fields = {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    password: { type: String, required: true, select: false },
    lastName: { type: String },
    phone: { type: String },
    role: {
      type: String,
      enum: Object.values(CONSTANTS.USER_ROLES),
      default: CONSTANTS.USER_ROLES.USER,
    },
    isEmailVerified: { type: Boolean, default: false },
    profileImage: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    systemLanguage: {
      type: String,
      enum: Object.values(CONSTANTS.SYSTEM_LANGUAGES),
      default: CONSTANTS.SYSTEM_LANGUAGES.EN,
    },
  };
  constructor() {
    super(); // BaseModel constructor'ını çağırıyoruz
    this.initModel(); // initModel'ı burada çağırıyoruz
  }
}

const user = new User();

export default user;
