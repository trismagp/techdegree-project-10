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
    }).catch(function(err){
      res.send(500);
    });
  }else{
    Book.findAll().then(function(books){
      res.render("books/index", {books: books, title: "Books"});
    }).catch(function(err){
      res.send(500);
    });
  }
});

/* POST create book. */
router.post('/', function(req, res, next) {
  Book.create(req.body).then(function(book){
    res.redirect("/books");
  }).catch(function(err){
    if(err.name === "SequelizeValidationError"){
        res.render("books/new", {book: Book.build(req.body), button_text: "Create New Book", title: "New Book", errors: err.errors});
    }else{
      throw err;
    }
  }).catch(function(err){
    res.send(500);
  });
});

/* Create a new article form. */
router.get('/new', function(req, res, next) {
  res.render("books/new", {book: Book.build(), button_text: "Create New Book", title: "New Book"});
});

/* Edit article form. */
router.get("/:id/edit", function(req, res, next){
  Book.findById(req.params.id).then(function(book){
    if(book){
      Loan.findAll({ include: [{model:Patron}], where: {book_id:req.params.id}}).then(function(loans){
        res.render("books/edit", {book: book, loans: loans, button_text: "Save"});
      }).catch(function(err){
        res.send(500);
      });
    }else{
      res.send(404);
    }
  }).catch(function(err){
    res.send(500);
  });
});


/* GET individual article. */
router.get("/:id", function(req, res, next){
  Book.findById(req.params.id).then(function(book){
    if(book){
      Loan.findAll({ include: [{model:Patron}], where: {book_id:req.params.id}}).then(function(loans){
        res.render("books/show", {book: book, loans: loans, button_text: "Edit", title: book.title});
      }).catch(function(err){
        res.send(500);
      });
    }else{
      res.send(404);
    }
  }).catch(function(err){
    res.send(500);
  });
});

/* PUT update article. */
router.put("/:id", function(req, res, next){
  Book.findById(req.params.id).then(function(book){
    if(book){
      return book.update(req.body);
    }else{
      res.send(404);
    }
  }).then(function(book){
      res.redirect("/books");
  }).catch(function(err){
    if(err.name === "SequelizeValidationError"){
        var book = Book.build(req.body);
        book.id = req.params.id;
        Loan.findAll({ include: [{model:Patron}], where: {book_id:req.params.id}}).then(function(loans){
          res.render("books/edit", {book: book, loans: loans, button_text: "Save", errors: err.errors});
        }).catch(function(err){
          res.send(500);
        });
    }else{
      throw err;
    }
  }).catch(function(err){
    res.send(500);
  });
});

// *********************************************************************************
// route to return books form a book's page and redirecting to the book's page
// *********************************************************************************

// router.get("/:bookId/loans/:loanId/return", function(req, res, next){
//   renderReturnBookLoanForm(req, res, next, null);
// });
//
// router.put("/:bookId/loans/:loanId/return", function(req, res, next){
//   Loan.findById(req.params.loanId).then(function(loan){
//     if(loan){
//       return loan.update(req.body);
//     }else{
//       res.send(404);
//     }
//   }).then(function(book){
//     res.redirect("/books/" + req.params.bookId);
//   }).catch(function(err){
//     if(err.name === "SequelizeValidationError"){
//       renderReturnBookLoanForm(req, res, next, err.errors);
//     }else{
//       throw err;
//     }
//   }).catch(function(err){
//     res.send(500);
//   });
// });
//
// function renderReturnBookLoanForm(req, res, next, errors){
//   Loan.getCheckedOutLoan(req.params.loanId).then(function(loan){
//     if (loan) {
//       let now = new Date();
//       loan.returned_on = dateFormat(now, "yyyy-mm-dd");
//       let { Book, Patron} = loan.dataValues;
//       res.render(
//         "loans/return",
//         {
//           redirect_route:`/books/${req.params.bookId}/loans/${req.params.loanId}/return`,
//           loan: loan,
//           book: Book,
//           patron: Patron,
//           button_text: "Return book",
//           title: "Return book",
//           errors:errors
//         }
//       );
//     }else{
//       res.send(404);
//     }
//   }).catch(function(err){
//     res.send(500);
//   });
// }

module.exports = router;
