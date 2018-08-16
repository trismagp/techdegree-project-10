var express = require('express');
var router = express.Router();
var Book = require("../models").Book;
var Loan = require("../models").Loan;
var Patron = require("../models").Patron;
var dateFormat = require('dateformat');

// TODO: return book
// TODO: link patron

/* GET articles listing. */
router.get('/', function(req, res, next) {
  Book.findAll().then(function(books){
    res.render("books/index", {books: books});
  })
});

/* POST create article. */
router.post('/', function(req, res, next) {
  Loan.create(req.body).then(function(loan){
    res.redirect(`/loans/${loan.id}`);
  });
});

/* Create a new article form. */
router.get('/new', function(req, res, next) {
  res.render("books/new", {book: Book.build(), button_text: "Create New Book"});
});

/* Edit article form. */
router.get("/:id/edit", function(req, res, next){
  Book.findById(req.params.id).then(function(book){
    Loan.findAll({ include: [{model:Patron}], where: {book_id:req.params.id}}).then(function(loans){
      res.render("books/edit", {book: book, loans: loans, button_text: "Save"});
    })
  });
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
    Loan.findAll({ include: [{model:Patron}], where: {book_id:req.params.id}}).then(function(loans){
      res.render("books/show", {book: book, loans: loans, button_text: "Edit"});
    })
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
