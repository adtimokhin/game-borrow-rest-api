const Response = require("../../response.js");
const axios = require("axios").default;
// const http = require("http");

const options = {
  hostname: "http://localhost",
  port: process.env.EMAIL_PORT || 4129, // TODO: add this as an env variable to the Dockerfile
};

/**
 * Makes an API request that sends a simple text SMTP email to users mentioned.
 *
 * @param {Any} recepients array of Strings that indicate emails to which a certain text message should be sent
 * @param {String} subject a subject of email
 * @param {String} text a text message that must be sent
 *
 * @returns {Promise}
 */
module.exports.sendTextEmail = (recepients, subject, text) => {
  //TODO: parse recepeints as a list!
  return axios.get(`${options.hostname}:${options.port}/send/simple`, {
    data: {
      to: recepients,
      subject: subject,
      text: text,
    },
  });
};

/**
 * Makes an API request that sends an HTML email to recepeints.
 *
 * @param {String[]} recepients array of Strings that indicate emails to which a certain text message should be sent
 * @param {String} subject a subject of email
 * @param {String} template matches one of template names. Default ones are mentioned here: https://github.com/adtimokhin/game-borrow-email/tree/main/email-templates
 * @param {Object} data additional data that will be used to populate fields in the template. The keys must match the values in the '${}' syntax in the template
 *
 * @returns {Promise}
 */
module.exports.sendHTMLTemplateEmail = (
  recepients,
  subject,
  template,
  data
) => {
  //TODO: parse recepeints as a list!
  return axios.get(`${options.hostname}:${options.port}/send/template`, {
    data: {
      to: recepients,
      subject: subject,
      template: template,
      data: data,
    },
  });
};
