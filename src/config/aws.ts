import systemSettings from './systemSettings'
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3'

const s3ClientConfig: S3ClientConfig = {
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
}

const s3Client = new S3Client(s3ClientConfig)

// S3 Config

const s3Config = {
  bucketName: process.env.S3_BUCKET_NAME,
  region: process.env.S3_REGION,
  signedUrlExpireSeconds: 60 * 60 * 24, // 1 day
  allowedFileTypes: {
    images: ['.jpg', '.jpeg', '.png', '.gif'],
    documents: ['.pdf', '.doc', '.docx', '.txt'],
  },
  maxFileSize: systemSettings.megabyteOfMaxFileSizeForUpload * 1024 * 1024, // MB to Bytes
  folders: {
    profiles: 'profiles',
    documents: 'documents',
  },
}

export { s3Config, s3Client }

/* -------------------------------------------------- */
