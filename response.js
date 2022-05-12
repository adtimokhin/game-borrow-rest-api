class Response {
  /**
   *
   * @param {Number} statusCode corresponds to HTTP code of reponse
   * @param {String} message message of the response
   * @param {Object} data Data that will be rreturned to the client
   */
  constructor(statusCode, message = "", data = {}) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

module.exports = Response;
