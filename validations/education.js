const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateEducationInput(data) {
  let errors = {};

  data.institute = !isEmpty(data.institute) ? data.institute : '';
  data.degree = !isEmpty(data.degree) ? data.degree : '';
  data.fieldOfStudy = !isEmpty(data.fieldOfStudy) ? data.fieldOfStudy : '';
  data.from = !isEmpty(data.from) ? data.from : '';

  if (Validator.isEmpty(data.institute)) {
    errors.institute = 'Institute field is required';
  }

  if (Validator.isEmpty(data.degree)) {
    errors.degree = 'Degree field is required';
  }

  if (Validator.isEmpty(data.fieldOfStudy)) {
    errors.fieldOfStudy = 'Field of study field is required';
  }

  if (Validator.isEmpty(data.from)) {
    errors.from = 'From date field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
