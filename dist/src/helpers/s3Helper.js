"use strict";
/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const aws_1 = require("../config/aws");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const http_errors_1 = __importDefault(require("http-errors"));
class S3Helper {
    constructor() {
        this.s3Client = aws_1.s3Client;
        this.bucketName = aws_1.s3Config.bucketName || '';
    }
    /**
     * Dosya yükleme işlemi
     * @param {Buffer} fileBuffer - Dosya buffer'ı
     * @param {string} fileName - Dosya adı
     * @param {string} folder - Klasör adı (profiles/documents)
     * @param {string} userId - Kullanıcı ID
     * @returns {Promise<Object>} - Yüklenen dosya bilgileri
     */
    uploadFile(fileBuffer, fileName, folder, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileExtension = path_1.default.extname(fileName).toLowerCase();
                const isValidFileType = this._validateFileType(fileExtension, folder);
                if (!isValidFileType) {
                    throw (0, http_errors_1.default)(400, 'Geçersiz dosya tipi');
                }
                // Dosya boyutunu kontrol et
                if (fileBuffer.length > aws_1.s3Config.maxFileSize) {
                    throw (0, http_errors_1.default)(400, 'File size exceeds limit');
                }
                // Benzersiz dosya adı oluştur
                const key = `${folder}/${(0, uuid_1.v4)()}${fileExtension}`;
                const command = new client_s3_1.PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    Body: fileBuffer,
                    ContentType: this._getContentType(fileExtension),
                });
                // Upload işlemini bekle ve sonucu kontrol et
                yield this.s3Client.send(command);
                return {
                    key,
                    bucket: this.bucketName,
                };
            }
            catch (error) {
                throw (0, http_errors_1.default)(error.statusCode || 500, error.message);
            }
        });
    }
    /**
     * Dosya silme işlemi
     * @param {string} key - Dosya anahtarı
     * @returns {Promise<void>}
     */
    deleteFile(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!key || typeof key !== 'string') {
                    return;
                }
                const command = new client_s3_1.DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                });
                yield this.s3Client.send(command);
            }
            catch (error) {
                throw (0, http_errors_1.default)(error.statusCode || 500, error.message);
            }
        });
    }
    /**
     * Geçici URL oluşturma
     * @param {string} key - Dosya anahtarı
     * @param {number} expires - Geçerlilik süresi (saniye)
     * @returns {Promise<string>} - Geçici URL
     */
    generatePresignedUrl(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, expires = aws_1.s3Config.signedUrlExpireSeconds) {
            try {
                const command = new client_s3_1.GetObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                });
                const presignedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
                    expiresIn: expires,
                });
                return presignedUrl;
            }
            catch (error) {
                throw (0, http_errors_1.default)(error.statusCode || 500, error.message);
            }
        });
    }
    /**
     * Dosya sorgulama
     * @param {string} key - Dosya anahtarı
     * @returns {Promise<Object>} - Dosya metadata
     */
    getFileMetadata(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = {
                    Bucket: this.bucketName,
                    Key: key,
                };
                return yield this.s3Client.send(new client_s3_1.HeadObjectCommand(params));
            }
            catch (error) {
                throw (0, http_errors_1.default)(error.statusCode || 500, error.message);
            }
        });
    }
    /**
     * Dosya güncelleme
     * @param {string} oldKey - Eski dosya anahtarı
     * @param {Buffer} fileBuffer - Yeni dosya buffer'ı
     * @param {string} fileName - Yeni dosya adı
     * @param {string} folder - Klasör adı
     * @param {string} userId - Kullanıcı ID
     * @returns {Promise<Object>} - Güncellenen dosya bilgileri
     */
    updateFile(oldKey, fileBuffer, fileName, folder, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Eski dosyayı sil
                yield this.deleteFile(oldKey);
                // Yeni dosyayı yükle
                return yield this.uploadFile(fileBuffer, fileName, folder, userId);
            }
            catch (error) {
                throw (0, http_errors_1.default)(error.statusCode || 500, error.message);
            }
        });
    }
    /**
     * Dosya tipi kontrolü
     * @private
     */
    _validateFileType(extension, folder) {
        const allowedTypes = folder === 'profiles'
            ? aws_1.s3Config.allowedFileTypes.images
            : [...aws_1.s3Config.allowedFileTypes.images, ...aws_1.s3Config.allowedFileTypes.documents];
        return allowedTypes.includes(extension.toLowerCase());
    }
    /**
     * Content-Type belirleme
     * @private
     */
    _getContentType(extension) {
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.txt': 'text/plain',
            '.mp4': 'video/mp4',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
            '.m4a': 'audio/mp4',
            '.m4v': 'video/mp4',
            '.m4b': 'audio/mp4',
            '.m4p': 'audio/mp4',
            '.zip': 'application/zip',
            '.rar': 'application/x-rar-compressed',
            '.7z': 'application/x-7z-compressed',
            '.tar': 'application/x-tar',
            '.gz': 'application/gzip',
            '.bz2': 'application/x-bzip2',
            '.webm': 'video/webm',
            '.mov': 'video/quicktime',
            '.avi': 'video/x-msvideo',
            '.mkv': 'video/x-matroska',
            '.wmv': 'video/x-ms-wmv',
            '.flv': 'video/x-flv',
            '.swf': 'application/x-shockwave-flash',
        };
        return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
    }
}
const s3Helper = new S3Helper();
exports.default = s3Helper;
/* -------------------------------------------------- */
