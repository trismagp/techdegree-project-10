'use strict';
module.exports = (sequelize, DataTypes) => {
  var Loan = sequelize.define('Loan', {
    book_id: DataTypes.INTEGER,
    patron_id: DataTypes.INTEGER,
    loaned_on: DataTypes.DATEONLY,
    return_by: DataTypes.DATEONLY,
    returned_on: DataTypes.DATEONLY
  }, {
    timestamps: false
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
