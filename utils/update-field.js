// Method will take in the object, the corresponding field and it will throw a 422 error if the new value matches the one stored.
// Method returns true if the property's field has been modified.
function updateField(object, propertyName, newValue) {
  if (newValue) {
    if (object[propertyName] === newValue) {
      const err = new Error(
        `Updated value for field of ${propertyName} matches the one stored in the database.`
      );
      err.statusCode = 422;
      throw err;
    }

    object[propertyName] = newValue;
    return true;
  }

  return false;
}

module.exports = updateField;
