/* *******************************************************
 * NODEJS PROJECT © 2025 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */

import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client, s3Config } from '../config/aws'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import createError from 'http-errors'

class S3Helper {
  private s3Client: any
  private bucketName: string

  constructor() {
    this.s3Client = s3Client
    this.bucketName = s3Config.bucketName || ''
  }

  /**
   * Dosya yükleme işlemi
   * @param {Buffer} fileBuffer - Dosya buffer'ı
   * @param {string} fileName - Dosya adı
   * @param {string} folder - Klasör adı (profiles/documents)
  //  * @param {string} userId - Kullanıcı ID
   * @returns {Promise<Object>} - Yüklenen dosya bilgileri
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    folder: string,
    // userId: string,
  ): Promise<Object> {
    try {
      const fileExtension = path.extname(fileName).toLowerCase()
      const isValidFileType = this._validateFileType(fileExtension, folder)

      if (!isValidFileType) {
        throw createError(400, 'Geçersiz dosya tipi')
      }

      if (fileBuffer.length > s3Config.maxFileSize) {
        throw createError(400, 'File size exceeds limit')
      }

      const key = `${folder}/${uuidv4()}${fileExtension}`

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: this._getContentType(fileExtension),
      })

      await this.s3Client.send(command)

      return {
        key,
        bucket: this.bucketName,
      }
    } catch (error: any) {
      throw createError(error.statusCode || 500, error.message)
    }
  }

  /**
   * file delete func
   * @param {string} key - file key
   * @returns {Promise<void>}
   */
  async deleteFile(key: string): Promise<void> {
    try {
      if (!key || typeof key !== 'string') {
        return
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })

      await this.s3Client.send(command)
    } catch (error: any) {
      throw createError(error.statusCode || 500, error.message)
    }
  }

  /**
   * persigned url
   * @param {string} key - file key
   * @param {number} expires - expires time
   * @returns {Promise<string>} - presign url
   */
  async generatePresignedUrl(
    key: string,
    expires = s3Config.signedUrlExpireSeconds,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: expires,
      })
      return presignedUrl
    } catch (error: any) {
      throw createError(error.statusCode || 500, error.message)
    }
  }

  /**
   * file query
   * @param {string} key - file key
   * @returns {Promise<Object>} - file metadata
   */
  async getFileMetadata(key: string): Promise<Object> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
      }

      return await this.s3Client.send(new HeadObjectCommand(params))
    } catch (error: any) {
      throw createError(error.statusCode || 500, error.message)
    }
  }

  /**
   * file update
   * @param {string} oldKey - old file key
   * @param {Buffer} fileBuffer - new file buffer
   * @param {string} fileName - new file name
   * @param {string} folder - folder name
   * @param {string} userId - user ID
   * @returns {Promise<Object>} - updated file info
   */
  async updateFile(
    oldKey: string,
    fileBuffer: Buffer,
    fileName: string,
    folder: string,
  ): Promise<Object> {
    try {
      await this.deleteFile(oldKey)

      return await this.uploadFile(fileBuffer, fileName, folder)
    } catch (error: any) {
      throw createError(error.statusCode || 500, error.message)
    }
  }

  /**
   *
   * @private
   */
  private _validateFileType(extension: string, folder: string): boolean {
    const allowedTypes =
      folder === 'profiles'
        ? s3Config.allowedFileTypes.images
        : [...s3Config.allowedFileTypes.images, ...s3Config.allowedFileTypes.documents]

    return allowedTypes.includes(extension.toLowerCase())
  }

  /**
   * Content-Type belirleme
   * @private
   */
  private _getContentType(extension: string): string {
    const mimeTypes: Record<string, string> = {
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
    }
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
  }
}

const s3Helper = new S3Helper()

export default s3Helper

/* -------------------------------------------------- */
