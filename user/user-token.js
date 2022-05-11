class UserToken {
  constructor(tokenValue) {
    this.tokenValue = tokenValue;
    this.created = new Date();
  }
}

module.exports = UserToken;
