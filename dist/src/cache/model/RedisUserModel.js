"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisUserModel = void 0;
class RedisUserModel {
    constructor(id, role, email, firstName, lastName, profileImage) {
        this.id = id;
        this.role = role;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.profileImage = profileImage;
    }
}
exports.RedisUserModel = RedisUserModel;
