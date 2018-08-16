var express = require('express');
var router = express.Router();
var Loan = require("../models").Loan;
var Book = require("../models").Book;
var Patron = require("../models").Patron;
var dateFormat = require('dateformat');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;


// TODO: return book
// TODO: new loan
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



function getAvailableBooks(){

  getLoans("checkedout").then(function(checkedout){
    
  })

  return Book.findAll();
}

/* GET articles listing. */
router.get('/', function(req, res, next) {
  getLoans(req.query.filter).then(function(loans){
    res.render("loans/index", {loans: loans});
  })
});

/* POST create article. */
router.post('/', function(req, res, next) {
  Book.create(req.body).then(function(book){
    res.redirect("/books");
      // res.redirect("/books/" + book.id);
  });
});

/* Create a new article form. */
router.get('/new', function(req, res, next) {
  res.render("books/new", {book: Book.build(), button_text: "Create New Book"});
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
  Book.findById(req.params.id).then(function(book){
      res.render("books/show", {book: book, button_text: "Edit"});
  });
});

/* PUT update article. */
router.put("/:id", function(req, res, next){
  Book.findById(req.params.id).then(function(book){
    return book.update(req.body);
  }).then(function(book){
      res.redirect("/books/" + book.id);
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
