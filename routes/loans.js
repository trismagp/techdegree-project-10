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
  }).catch(function(err){
    res.send(500);
  })
});



/* POST create loan. */
router.post('/', function(req, res, next) {
  Loan.create(req.body).then(function(loan){
    res.redirect("/loans");
  }).catch(function(err){
    res.send(500);
  });
});

// Before displaying the new loan form,
// 1. the checked out book ids are fetch with Loan.getLoans("checkedout") then listed in "checkedoutBookIds"
// 2. all books are filtered with checkedoutBookIds and we get the "availableBooks" array
// 3. all patrons are fetched and listed in "patrons"
// 4. "availableBooks" and "patrons" are sent to the new loan form for the selectors
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
      }).catch(function(err){
        res.send(500);
      })
    }).catch(function(err){
      res.send(500);
    })
  }).catch(function(err){
    res.send(500);
  })
});

// can only return a loan that has no returned_on date
// therefor using Loan.getCheckedOutLoan to retrieve a loan
router.get("/:id/return", function(req, res, next){
  Loan.getCheckedOutLoan(req.params.id).then(function(loan){
    if(loan){
      let { Book, Patron } = loan.dataValues;
      res.render(
        "loans/return",
        {
          redirect_route:`/loans/${req.params.id}`,
          loan: loan, book: Book.dataValues,
          patron: Patron.dataValues,
          button_text: "Return book"
        }
      );
    }else{
      res.send(404);
    }
  }).catch(function(err){
    res.send(500);
  });
});

/* PUT update article. */
router.put("/:id", function(req, res, next){
  Loan.findById(req.params.id).then(function(loan){
    if(loan){
      return loan.update(req.body);
    }else{
      res.send(404);
    }
  }).then(function(loan){
      res.redirect("/loans");
  }).catch(function(err){
    res.send(500);
  });
});

module.exports = router;
