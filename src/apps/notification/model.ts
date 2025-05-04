import { IBaseDocument, Model } from '../../database/Model'
import CONSTANTS from '../../config/constants'

export interface INotification extends IBaseDocument {}

const Notification = new (class extends Model {
  name = 'Notification'
  table = 'notification'
  searchs = ['userId', 'priority', 'message', 'isRead']
  fields = {
    userId: {
      type: this.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      required: true,
    },
    releaseDate: {
      type: Date,
      index: true,
      default: new Date(),
    },
    priority: {
      type: String,
      enum: Object.values(CONSTANTS.NOTIFICATON_PRIORITY),
      default: CONSTANTS.NOTIFICATON_PRIORITY.LOW,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    emailSentTime: {
      type: Number,
      default: null,
    },
    notifySentTime: {
      type: Number,
      default: null,
    },
  }
  listJoins = [{ path: 'userId', select: 'firstName lastName email image' }]
  readJoins = [{ path: 'userId', select: EXCLUDE_FIELDS }]
})()

Notification.run()

export default Notification
