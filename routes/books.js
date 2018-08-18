var express = require('express');
var router = express.Router();
var Book = require("../models").Book;
var Loan = require("../models").Loan;
var Patron = require("../models").Patron;
var dateFormat = require('dateformat');

// TODO: return book
// TODO: link patron

/* GET books listing. */
router.get('/', function(req, res, next) {
  if(req.query.filter){
    // filtering checked out or overdue books for the following routes:
    // 1. /books?filter=checkedout
    // 2. /books?filter=ouverdue
    Loan.getLoans(req.query.filter).then(function(filteredLoans){
      let books = filteredLoans.map(loan => loan.dataValues.Book.dataValues);
      res.render("books/index", {books: books, title: req.query.filter === "checkedout" ? "Checked Out Books" : "Overdue Books"});
    });
  }else{
    Book.findAll().then(function(books){
      res.render("books/index", {books: books, title: "Books"});
    });
  }
});

/* POST create book. */
router.post('/', function(req, res, next) {
  Book.create(req.body).then(function(book){
    res.redirect(`/books/${book.id}`);
  });
});

/* Create a new article form. */
router.get('/new', function(req, res, next) {
  res.render("books/new", {book: Book.build(), button_text: "Create New Book", title: "New Book"});
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
      res.render("books/show", {book: book, loans: loans, button_text: "Edit", title: book.title});
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

router.put("/:id/return", function(req, res, next){
  Loan.getLoans("checkedout").then(function(checkedoutLoans){
    let loan = checkedoutLoans.filter(loan => loan.dataValues.Book.dataValues.id === parseInt(req.params.id))[0];
    return loan.update(req.body);
  }).then(function(book){
      res.redirect("/books/" + req.params.id);
  });
});

router.get("/:id/return", function(req, res, next){
  Loan.getLoans("checkedout").then(function(checkedoutLoans){
    let loan = checkedoutLoans.filter(loan => loan.dataValues.Book.dataValues.id === parseInt(req.params.id))[0];
    res.render("loans/return", {redirect_route:`/books/${req.params.id}/return` ,loan: loan, book: loan.dataValues.Book, patron: loan.dataValues.Patron, button_text: "Return book", title: "Return book"});
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
