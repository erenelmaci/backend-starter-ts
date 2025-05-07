import systemSettings from './systemSettings'

const CONSTANTS = {
  SYSTEM_LANGUAGES: {
    EN: 'en',
    TR: 'tr',
    DE: 'de',
    ES: 'es',
    FR: 'fr',
    IT: 'it',
  },
  USER_ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    GUEST: 'guest',
  },
  S3_PATHS: {
    PROFILE: 'profiles',
    DOCUMENTS: 'documents',
  },
  NOTIFICATON_PRIORITY: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
  },
  ERRORS: {
    PAGE_NOT_FOUND: [404, 'Page Not Found.'],
    // Auth & Profile:
    AUTH_PASSIVE_SERVICE: [401, 'This login method is not active. Try again later.'],
    AUTH_OAUTH_FAILED: [401, 'Login with external authentication failed.'],
    AUTH_BLANK_DATA: [401, 'Please Sign In'],
    AUTH_WRONG_DATA: [401, 'Wrong email or password.'],
    AUTH_PASSIVE_USER: [401, 'This account is not active.'],
    AUTH_WRONG_TOKEN: [401, 'Wrong Token.', 'Authorizaton info not found in headers.'],
    EMAIL_USED: [401, 'This email is used by another user.'],
    EMAIL_SAME: [401, 'New email can not to be same of current email.'],
    EMAIL_NOT_FOUND: [401, 'This email is not registered for any user.'],
    EMAIL_NOT_CONFIRMED: [
      401,
      'E-Mail can not confirm. Maybe already confirmed, or key is wrong, or time expired.',
    ],
    PASSWORD_WRONG: [401, 'Current password is wrong.'],
    PASSWORD_SAME: [401, 'New password can not to be same of current password.'],
    PASSWORD_NOT_CONFIRMED: [
      401,
      'Password can not confirm. Maybe already confirmed, or key is wrong, or time expired.',
    ],
    WAIT_SENDMAIL: [401, 'You must wait sometime for sending new email.'],
    // Validators:
    INVALID_ID: [400, 'ID format is false.', 'It must be hex format and 24 chars.'],
    INVALID_EMAIL: [400, 'E-Mail format is false.'],
    INVALID_PASSWORD: [
      400,
      'Password format is false. (It must be min.8.chars and has letter & number & special chars.)',
    ],
    // Permissions:
    NO_LOGIN: [401, 'It must be logged user.'],
    NO_PERMISSION: [401, 'It must be has permission for this process.'],
    // Upload:
    FILE_NOT_FOUND: [404, 'There is not any file for upload process.'],
    FILE_DISALLOW: [400, 'This file (or filetype) not allowed for upload.'],
    MISSING_FIELDS: [400, 'Some fields are missing.'],
    PAYMENT_FAILED: [400, 'This payment method failed. Try again later.'],
    PAYMENT_INVALID_REQUEST: [400, 'This payment is invalid or maybe already paid or cancelled.'],
    // INTERNALS:
    //Mongo/Mongoose:
    11000: [400, 'This record already exists.'],
    // Multer:
    LIMIT_FILE_SIZE: [
      400,
      'File is large. Disallowed big files to upload.',
      'MaxSize: ' + systemSettings.megabyteOfMaxFileSizeForUpload + ' MB',
    ],
    RESOURCE_NOT_FOUND: [404, 'No data exists for the provided ID.'],
  },
}

export default CONSTANTS
