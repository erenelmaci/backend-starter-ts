module.exports = [
  // Admin kullanıcı
  {
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+905551112233',
    role: 'admin',
    isEmailVerified: true,
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    address: 'Admin Mah. Yönetici Sok. No:1',
    city: 'İstanbul',
    country: 'Türkiye',
    systemLanguage: 'tr',
    password: 'Admin1234!', // hashlenmeli
  },
  // Normal kullanıcı
  {
    email: 'user@example.com',
    firstName: 'Ali',
    lastName: 'Veli',
    phone: '+905554443322',
    role: 'user',
    isEmailVerified: true,
    profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
    address: 'Kullanıcı Cad. Basit Apt. No:2',
    city: 'Ankara',
    country: 'Türkiye',
    systemLanguage: 'tr',
    password: 'User1234!', // hashlenmeli
  },
  // İngilizce konuşan bir kullanıcı
  {
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+14155552671',
    role: 'user',
    isEmailVerified: false,
    profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    address: '123 Fake St.',
    city: 'London',
    country: 'UK',
    systemLanguage: 'en',
    password: 'Password123!', // hashlenmeli
  },
  // Fransız bir kullanıcı
  {
    email: 'jean.dupont@example.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: '+33123456789',
    role: 'user',
    isEmailVerified: false,
    profileImage: 'https://randomuser.me/api/portraits/men/4.jpg',
    address: '45 Rue de Paris',
    city: 'Paris',
    country: 'France',
    systemLanguage: 'fr',
    password: 'Motdepasse123!', // hashlenmeli
  },
]
