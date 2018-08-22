'use strict';
module.exports = (sequelize, DataTypes) => {
  var Loan = sequelize.define('Loan', {
    book_id: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: "book_id is required"
        },
        isInt: {
          msg: "book_id must be a number"
        }
      }
    },
    patron_id: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: "patron_id is required"
        },
        isInt: {
          msg: "patron_id must be a number"
        }
      }
    },
    loaned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: "Loan On is required"
        },
        isDate: {
          msg: "Loan On must be a date"
        }
      }
    },
    return_by: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: "Return by is required"
        },
        isDate: {
          msg: "Return by must be a date"
        }
      }
    },
    returned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        isDate: {
          msg: "Returned On must be a date"
        }
      }
    }
  },
  {
    timestamps: false,
    validate:{
      validateReturnBy: function() {
        if (this.loaned_on > this.return_by) {
          throw new Error('Return by date must be after Loaned On')
        }
      },
      validateReturnedOn: function() {
        if (this.returned_on) {
          if (this.loaned_on > this.returned_on) {
            throw new Error('Returned On date must be after Loaned On')
          }
        }
      }
    }
  });
  Loan.associate = function(models) {
    Loan.belongsTo(models.Book, {foreignKey: 'book_id'});
    Loan.belongsTo(models.Patron, {foreignKey: 'patron_id'});
  };


  Loan.getLoans = function(filter) {

    var whereObj = {};
    if(filter === "checkedout"){
      whereObj = {returned_on : null }
    } else if(filter === "overdue"){
      whereObj = {[sequelize.Op.and]: [{returned_on : null},{return_by : {[sequelize.Op.lt]: sequelize.literal('CURRENT_DATE')}}] }
    }else if(filter){
      if( filter.length > 0){
        // not returning any value if filter is not null and different from checkedout or overdue
        whereObj = { id : null }
      }
    }

    return Loan.findAll({ include: [{all:true}], where: [whereObj] });
  }

  Loan.getCheckedOutLoan = function(loanId){
    return Loan.find({ where:  {[sequelize.Op.and]: [{id: loanId}, {returned_on : null}]} , include: [{all:true}]});
  }

  Loan.getPatronLoans = function(patronId){
    return Loan.findAll({ include: [{all:true}], where: {patron_id:patronId}});
  }

  return Loan;
};
