export default [
  {
    emailLanguage: 'tr',
    emailTemplate: '{{content}}',
    emailConfirmation: {
      subject: 'E-posta Adresinizi Doğrulayın',
      content:
        'Merhaba {{firstName}},\n\nE-posta adresinizi doğrulamak için lütfen aşağıdaki bağlantıya tıklayın:\n\n{{confirmationLink}}\n\nTeşekkürler,\n{{companyName}}',
    },
    updatedEmailConfirmation: {
      subject: 'Yeni E-posta Adresinizi Doğrulayın',
      content:
        'Merhaba {{firstName}},\n\nYeni e-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:\n\n{{confirmationLink}}\n\nSaygılar,\n{{companyName}}',
    },
    passwordConfirmation: {
      subject: 'Şifre Sıfırlama Talebi',
      content:
        'Merhaba {{firstName}},\n\nŞifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanabilirsiniz:\n\n{{resetLink}}\n\nBu bağlantı {{expireMinutes}} dakika içinde geçerliliğini yitirecektir.\n\n{{companyName}}',
    },
    notification: {
      subject: 'Yeni Bildiriminiz Var',
      content:
        'Merhaba {{firstName}},\n\nYeni bir bildiriminiz var. Detaylar için uygulamayı ziyaret edin.\n\n{{companyName}}',
    },
  },
  {
    emailLanguage: 'fr',
    emailTemplate: '{{content}}',
    emailConfirmation: {
      subject: 'Confirmez votre adresse e-mail',
      content:
        'Bonjour {{firstName}},\n\nVeuillez cliquer sur le lien ci-dessous pour confirmer votre adresse e-mail :\n\n{{confirmationLink}}\n\nMerci,\n{{companyName}}',
    },
    updatedEmailConfirmation: {
      subject: 'Confirmez votre nouvelle adresse e-mail',
      content:
        'Bonjour {{firstName}},\n\nVeuillez cliquer sur le lien ci-dessous pour confirmer votre nouvelle adresse e-mail :\n\n{{confirmationLink}}\n\nCordialement,\n{{companyName}}',
    },
    passwordConfirmation: {
      subject: 'Demande de réinitialisation de mot de passe',
      content:
        'Bonjour {{firstName}},\n\nVous pouvez réinitialiser votre mot de passe en cliquant sur le lien suivant :\n\n{{resetLink}}\n\nCe lien expirera dans {{expireMinutes}} minutes.\n\n{{companyName}}',
    },
    notification: {
      subject: 'Nouvelle notification',
      content:
        "Bonjour {{firstName}},\n\nVous avez une nouvelle notification. Veuillez consulter l'application pour plus de détails.\n\n{{companyName}}",
    },
  },
  {
    emailLanguage: 'sp',
    emailTemplate: '{{content}}',
    emailConfirmation: {
      subject: 'Confirma tu dirección de correo electrónico',
      content:
        'Hola {{firstName}},\n\nHaz clic en el siguiente enlace para confirmar tu dirección de correo electrónico:\n\n{{confirmationLink}}\n\nGracias,\n{{companyName}}',
    },
    updatedEmailConfirmation: {
      subject: 'Confirma tu nueva dirección de correo',
      content:
        'Hola {{firstName}},\n\nHaz clic en el siguiente enlace para confirmar tu nueva dirección de correo electrónico:\n\n{{confirmationLink}}\n\nSaludos,\n{{companyName}}',
    },
    passwordConfirmation: {
      subject: 'Solicitud de restablecimiento de contraseña',
      content:
        'Hola {{firstName}},\n\nPuedes restablecer tu contraseña haciendo clic en el siguiente enlace:\n\n{{resetLink}}\n\nEste enlace caducará en {{expireMinutes}} minutos.\n\n{{companyName}}',
    },
    notification: {
      subject: 'Tienes una nueva notificación',
      content:
        'Hola {{firstName}},\n\nTienes una nueva notificación. Visita la aplicación para más detalles.\n\n{{companyName}}',
    },
  },
]
