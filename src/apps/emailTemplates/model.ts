import { Model } from '../../database/Model';

const EmailTemplate = new (class extends Model {
  name = 'EmailTemaplate';
  table = 'emailTemplate';
  searchs = [];
  fields = {
    emailLanguage: { type: String, trim: true, default: 'en' },
    emailTemplate: { type: String, trim: true, default: '{{content}}' },
    emailConfirmation: {
      type: Object,
      default: {
        subject: null,
        content: null,
      },
    },
    updatedEmailConfirmation: {
      type: Object,
      default: {
        subject: null,
        content: null,
      },
    },
    passwordConfirmation: {
      type: Object,
      default: {
        subject: null,
        content: null,
      },
    },
    notification: {
      type: Object,
      default: {
        subject: null,
        content: null,
      },
    },
  };
})();

EmailTemplate.run();

export default EmailTemplate;
