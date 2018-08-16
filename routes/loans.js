var express = require('express');
var router = express.Router();
var Loan = require("../models").Loan;
var Book = require("../models").Book;
var Patron = require("../models").Patron;
var dateFormat = require('dateformat');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;


// TODO: return laon
// TODO: edit, delete loan
// TODO: filter checked out books in loan form
// TODO: title

function getLoans(filter) {
  var whereObj = {};
  if(filter === "checkedout") whereObj = {returned_on : null }
  if(filter === "overdue") whereObj = {[Op.and]: [{returned_on : null},{return_by : {[Op.lt]: Sequelize.literal('CURRENT_DATE')}}] }

  return Loan.findAll({
    include: [{all:true}],
    where: [whereObj]
  })
}



// function getAvailableBooks(){
//
//   getLoans("checkedout").then(function(checkedout){
//
//   })
//
//   return Book.findAll();
// }

/* GET loans listing. */
router.get('/', function(req, res, next) {
  getLoans(req.query.filter).then(function(loans){
    res.render("loans/index", {loans: loans});
  })
});

/* POST create loan. */
router.post('/', function(req, res, next) {
  Loan.create(req.body).then(function(loan){
    res.redirect("/loans");
  });
});

/* Create a new article form. */
router.get('/new', function(req, res, next) {
  Book.findAll().then(function(books){
    Patron.findAll().then(function(patrons){
        res.render("loans/new", {loan: Loan.build(), books: books, patrons:patrons, button_text: "Create New Loan"});
    })
  })
});

/* Return loan form. */
router.get("/:id/return", function(req, res, next){
  Loan.findById(req.params.id).then(function(loan){
    Book.findById(loan.book_id).then(function(book){
      Patron.findById(loan.patron_id).then(function(patron){
        res.render("loans/return", {loan: loan, book: book, patron:patron, button_text: "Return book"});
      })
    })
  })
});


/* Edit article form. */
router.get("/:id/edit", function(req, res, next){
  Book.findById(req.params.id).then(function(book){
    res.render("books/edit", {book: book, button_text: "Update"});
  })
});


/* Delete article form. */
router.get("/:id/delete", function(req, res, next){
  Article.findById(req.params.id).then(function(article){
    res.render("articles/delete", {article: article, title: "Delete Article"});
  })

});


/* GET individual article. */
router.get("/:id", function(req, res, next){
  Loan.findById(req.params.id).then(function(loan){
    Book.findById(loan.book_id).then(function(book){
      Patron.findById(loan.patron_id).then(function(patron){
        res.render("loans/show", {loan: loan, button_text: "Edit"});
      })
    })
  });
});

/* PUT update article. */
router.put("/:id", function(req, res, next){
  Loan.findById(req.params.id).then(function(loan){
    return loan.update(req.body);
  }).then(function(loan){
      res.redirect("/loans");
  });
});

/* DELETE individual article. */
router.delete("/:id", function(req, res, next){

  Article.findById(req.params.id).then(function(article){
    return article.destroy();
  }).then(function(){
      res.redirect("/articles");
  });
});


module.exports = router;
