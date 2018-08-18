'use strict';
module.exports = (sequelize, DataTypes) => {
  var Loan = sequelize.define('Loan', {
    book_id: DataTypes.INTEGER,
    patron_id: DataTypes.INTEGER,
    loaned_on: DataTypes.DATE,
    return_by: DataTypes.DATE,
    returned_on: DataTypes.DATE
  }, {
    timestamps: false
  });
  Loan.associate = function(models) {
    Loan.belongsTo(models.Book, {foreignKey: 'book_id'});
    Loan.belongsTo(models.Patron, {foreignKey: 'patron_id'});
  };


  Loan.getLoans = function(filter) {
    var whereObj = {};
    if(filter === "checkedout") whereObj = {returned_on : null }
    if(filter === "overdue") whereObj = {[sequelize.Op.and]: [{returned_on : null},{return_by : {[sequelize.Op.lt]: sequelize.literal('CURRENT_DATE')}}] }

    return Loan.findAll({
      include: [{all:true}],
      where: [whereObj]
    })
  }


  return Loan;
};
