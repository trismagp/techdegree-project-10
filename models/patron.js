'use strict';
module.exports = (sequelize, DataTypes) => {
  var Patron = sequelize.define('Patron', {
    first_name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "First Name is required"
        }
      }
    },
    last_name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Last Name is required"
        }
      }
    },
    address: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Address is required"
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Email is required"
        },
        isEmail: {
          msg: "Incorrect Email format"
        }
      }
    },
    library_id: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Library ID is required"
        }
      }
    },
    zip_code: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: "Zip code is required"
        },
        isInt: {
          msg: "Zip code must be a number"
        }
      }
    }
  }, {
    timestamps: false
  });
  Patron.associate = function(models) {
    // associations can be defined here
  };

  Patron.findAndCountAllFilter = function(fullName, address, email, libraryId, zip, offset, limit){
    let zipMin = -1000000;
    let zipMax = 1000000;
    if(zip !== undefined){
      zipMin = zip;
      zipMax = zip;
    }

    return Patron.findAndCountAll({
     where: {
      [sequelize.Op.and]: [
          {
            [sequelize.Op.or]:[
               {
                 first_name: {
                   [sequelize.Op.like]:`%${fullName}%`
                 }
               },
               {
                 last_name: {
                   [sequelize.Op.like]:`%${fullName}%`
                 }
               }
           ]
        },
        {
          address: {
            [sequelize.Op.like]:`%${address}%`
          }
        },
        {
          email: {
            [sequelize.Op.like]:`%${email}%`
          }
        },
        {
          library_id: {
            [sequelize.Op.like]:`%${libraryId}%`
          }
        },
        {
          zip_code: {
            [sequelize.Op.between]:[zipMin,zipMax]
          }
        }
      ]
     }
   }).then(patrons =>{
      return {count:patrons.count, rows: patrons.rows.slice(limit * offset, limit * offset + limit )};
    });
  }

  return Patron;
};
