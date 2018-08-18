var express = require('express');
var router = express.Router();
var Loan = require("../models").Loan;
var Book = require("../models").Book;
var Patron = require("../models").Patron;
var dateFormat = require('dateformat');

// TODO: edit, delete loan
// TODO: filter checked out books in loan form
// TODO: title
// TODO: check form error

/* GET loans listing. */
router.get('/', function(req, res, next) {
  Loan.getLoans(req.query.filter).then(function(loans){
    let title = "Loans";
    if(req.query.filter){
      if(req.query.filter === "checkedout"){
        title = "Checked Out Loans";
      }
      if(req.query.filter === "overdue"){
        title = "Overdue Loans";
      }
    }
    res.render("loans/index", {loans: loans, title: title});
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
  Loan.getLoans("checkedout").then(function(checkedoutLoans){
    let checkedoutBookIds = [];
    checkedoutLoans.map(loan => checkedoutBookIds.push(loan.dataValues.Book.dataValues.id));
    Book.findAll().then(function(books){
      let availableBooks = books;
      if (checkedoutBookIds.length > 0) {
        availableBooks = books.filter(book => !checkedoutBookIds.includes(book.id));
      }
      Patron.findAll().then(function(patrons){
        let now = new Date();
        let loanedOn = dateFormat(now, "yyyy-mm-dd");
        var returnBy = new Date();
        // returnBy is today + 7 days
        returnBy = dateFormat(returnBy.setDate(now.getDate() + 7), "yyyy-mm-dd");
        res.render(
          "loans/new",
          {
            loan: Loan.build(),
            books: availableBooks,
            patrons:patrons,
            loaned_on : loanedOn,
            return_by : returnBy,
            button_text: "Create New Loan",
            title: "New Loan"
          }
        );
      })
    })
  })
});

// TODO: filter checkedout books
/* Return loan form. */
router.get("/:id/return", function(req, res, next){
  Loan.findById(req.params.id).then(function(loan){
    Book.findById(loan.book_id).then(function(book){
      Patron.findById(loan.patron_id).then(function(patron){
        res.render("loans/return", {redirect_route:`/loans/${req.params.id}`, loan: loan, book: book, patron:patron, button_text: "Return book"});
      })
    })
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
