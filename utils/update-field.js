/**
 * Method will take in the object, the corresponding field and it will throw a 422 error if the new value matches the one stored.
 * Otherwise the field would be updated. You can pass a null as the newValue attribute. Then nothing would be updated
 * @param {Object} object an object which field we try to update
 * @param {String} propertyName string name of a property that is attempted to be updated
 * @param {Object} newValue value that must be stored in the given property
 * @returns boolean value. True means that the update was successfull.
 * @throws an error if the field value is not different from the one stored previously
 */
function updateField(object, propertyName, newValue) {
  if (newValue) {
    if (object[propertyName] === newValue) {
      const err = new Error(
        `Updated value for field of ${propertyName} matches the one stored in the database.`
      );
      // err.statusCode = 422;
      throw err;
    }

    object[propertyName] = newValue;
    return true;
  }

  return false;
}

module.exports = updateField;
