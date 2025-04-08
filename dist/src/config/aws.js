"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = exports.s3Config = void 0;
const systemSettings_1 = __importDefault(require("./systemSettings"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3ClientConfig = {
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
};
const s3Client = new client_s3_1.S3Client(s3ClientConfig);
exports.s3Client = s3Client;
// S3 Config
const s3Config = {
    bucketName: process.env.S3_BUCKET_NAME,
    region: process.env.S3_REGION,
    signedUrlExpireSeconds: 60 * 60 * 24, // 1 gün
    allowedFileTypes: {
        images: ['.jpg', '.jpeg', '.png', '.gif'],
        documents: ['.pdf', '.doc', '.docx', '.txt'],
    },
    maxFileSize: systemSettings_1.default.megabyteOfMaxFileSizeForUpload * 1024 * 1024, // MB to Bytes
    folders: {
        profiles: 'profiles',
        documents: 'documents',
    },
};
exports.s3Config = s3Config;
/* -------------------------------------------------- */
