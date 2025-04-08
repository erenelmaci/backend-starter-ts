"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = __importDefault(require("../config/constants"));
const errorHandler = (err, req, res, next) => {
    var _a;
    let errorData = {
        error: true,
        method: req.method,
        code: err.errorCode || err.code,
    };
    if (err.missingFields) {
        errorData.details = err.missingFields;
    }
    const errorCode = errorData.code;
    if (errorCode && constants_1.default.ERRORS[errorCode]) {
        const errorInfo = constants_1.default.ERRORS[errorCode];
        errorData.status = typeof errorInfo[0] === 'number' ? errorInfo[0] : 500;
        errorData.message = typeof errorInfo[1] === 'string' ? errorInfo[1] : err.message;
        errorData.cause = typeof errorInfo[2] === 'string' ? errorInfo[2] : err.cause;
    }
    else {
        errorData.status = 500;
        errorData.message = err.message;
        errorData.cause = err.cause;
    }
    if (((_a = process.env) === null || _a === void 0 ? void 0 : _a.ENV) !== 'production') {
        errorData = Object.assign(Object.assign({}, errorData), { internal: err.message, stack: err.stack, body: req.body });
        if (err.missingFields) {
            errorData.details = err.missingFields;
        }
    }
    return res.status(errorData.status || 500).send(errorData);
};
exports.default = errorHandler;
