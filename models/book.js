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
    first_published: DataTypes.INTEGER
  }, {
      timestamps: false,
      validate:{
        validateFirstPhublished: function() {      // first_published is optional and an int
          if(this.first_published){
            if (!Number.isInteger(parseInt(this.first_published))) {
              throw new Error('first published should be an integer')
            }
          }
        }
      }
  });
  Book.associate = function(models) {
    // associations can be defined here
  };



  return Book;
};
