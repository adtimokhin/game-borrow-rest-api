const Response = require("../../response.js");

// const options = {
//   hostname: "localhost",
//   port: 8080,
//   path: "/send/",
//   method: "GET",
// };

/**
 * Makes an API request that sends a simple text SMTP email to users mentioned.
 *
 * @param {Array} recepients array of Strings that indicate emails to which a certain text message should be sent
 * @param {String} subject a subject of email
 * @param {String} text a text message that must be sent
 *
 * @returns {Response}
 */
module.exports.sendTextEmail = (recepients, subject, text) => {
  //TODO: parse recepeints as a list!
  // TODO: make this method!
};

/**
 * Makes an API request that sends an HTML email to recepeints.
 *
 * @param {Array} recepients array of Strings that indicate emails to which a certain text message should be sent
 * @param {String} subject a subject of email
 * @param {String} template matches one of template names. Default ones are mentioned here: https://github.com/adtimokhin/game-borrow-email/tree/main/email-templates
 * @param {Object} data additional data that will be used to populate fields in the template. The keys must match the values in the '${}' syntax in the template
 *
 * @returns {Response}
 */
module.exports.sendHTMLTemplateEmail = (
  recepients,
  subject,
  template,
  data
) => {
    //TODO: parse recepeints as a list!
  // TODO: make this method!
};
