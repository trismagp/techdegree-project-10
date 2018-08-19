'use strict';

// https://sequelize.readthedocs.io/en/2.0/docs/models-definition/#validations

module.exports = (sequelize, DataTypes) => {
  var Book = sequelize.define('Book', {
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Title is required"
        }
      }
    },
    author: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Author is required"
        }
      }
    },
    genre: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Genre is required"
        }
      }
    },
    first_published: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: "First Published is required"
        },
        isInt: {
          msg: "First Published must be a number"
        }
      }
    },
  }, {
      timestamps: false
  });
  Book.associate = function(models) {
    // associations can be defined here
  };



  return Book;
};
