const jwt = require('jsonwebtoken');

const generateToken = (res, userId, role) => {
  try {
    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    throw new Error('Failed to generate authentication token');
  }
};

module.exports = generateToken;