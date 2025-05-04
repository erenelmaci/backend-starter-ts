import { IBaseDocument, Model } from '../../database/Model'
import CONSTANTS from '../../config/constants'

export interface IFile extends IBaseDocument {}

const File = new (class extends Model {
  name = 'File'
  table = 'file'
  searchs = ['name', 'model', 'title', 'type']
  fields = {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    model: {
      type: String,
      trim: true,
      index: true,
      required: true,
    },
    modelId: {
      type: this.ObjectId,
      index: true,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: null,
    },
    type: {
      type: String,
      trim: true,
      default: null,
    },
    folder: {
      type: String,
      trim: true,
      enum: Object.values(CONSTANTS.S3_PATHS),
      required: true,
      index: true,
      default: CONSTANTS.S3_PATHS.DOCUMENTS,
    },
    details: {
      type: Object,
      default: null,
    },
    key: {
      type: String,
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
  }
  listJoins = [{ path: 'userId', select: 'firstName lastName email image' }]
  readJoins = [{ path: 'userId', select: EXCLUDE_FIELDS }]
})()

File.run()

export default File
