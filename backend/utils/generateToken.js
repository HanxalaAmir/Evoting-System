const jwt = require('jsonwebtoken');

const generateToken = (res, userId, role) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '30m',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 60 * 1000,
    path: '/'
  });

  return token;
};

module.exports = generateToken;