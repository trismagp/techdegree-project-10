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
        validateFirstPhublished: function() {      // first_published is optional and an integer
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


  Book.findAndCountAllFilter = function(activeLoansBookIds, title, author, genre, year, offset, limit){
    let yearStart = -10000;
    let yearEnd = 10000;
    if(year !== undefined){
      yearStart = year;
      yearEnd = year;
    }


    return Book.max('id').then(maxBookId =>{
      // activeLoansBookIds equals to
      // []: if no filter (overdue or checkedout) is selected, which means length === 0
      // [-1]: if a filter is selected but there's no active loan related, will filter out all books
      // or will contain the book ids for the active loans related to filter
      let booksIdsToDisplay = activeLoansBookIds;
      if(activeLoansBookIds.length === 0 ){
        // list all the the book ids from 1 to maxBookId included
        // [1, 2, 3, ....., maxBookId]
        booksIdsToDisplay = [...Array(maxBookId + 1).keys()];
      }

      return Book.findAndCountAll({
       where: {
         [sequelize.Op.and]: [
           {
             id: {
               [sequelize.Op.in]: booksIdsToDisplay
             }
           },
          {
            title: {
              [sequelize.Op.like]:`%${title}%`
            }
          },
          {
            author: {
              [sequelize.Op.like]:`%${author}%`
            }
          },
          {
            genre: {
              [sequelize.Op.like]:`%${genre}%`
            }
          },
          {
            first_published: {
              [sequelize.Op.or]: {
                 [sequelize.Op.between]:[yearStart,yearEnd],
                 [sequelize.Op.eq]: ""
               }
            }
          }
        ]
       }
      }).then(books =>{
        return {count:books.count, rows: books.rows.slice(limit * offset, limit * offset + limit )};
      }).catch(function(err){
        res.send(500);
      });
    }).catch(function(err){
      res.send(500);
    });
  };
  return Book;
};
