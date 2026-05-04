const PASSWORD_RULE_MESSAGE =
  'A jelszónak 8-16 karakter hosszúnak kell lennie, tartalmaznia kell legalább egy kisbetűt, egy nagybetűt, egy számot és egy speciális karaktert.';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,16}$/;

function isPasswordValid(password) {
  return typeof password === 'string' && passwordRegex.test(password);
}

function validatePassword(password) {
  if (!isPasswordValid(password)) {
    const error = new Error(PASSWORD_RULE_MESSAGE);
    error.statusCode = 400;
    throw error;
  }
}

module.exports = {
  PASSWORD_RULE_MESSAGE,
  isPasswordValid,
  validatePassword,
};