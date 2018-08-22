var express = require('express');
var router = express.Router();
var Loan = require("../models").Loan;
var Book = require("../models").Book;
var Patron = require("../models").Patron;
var dateFormat = require('dateformat');


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
    if(err.name === "SequelizeValidationError"){
        let loan = Loan.build(req.body);
        renderNewLoanForm(req, res, next, loan, err.errors);
    }else{
      throw err;
    }
  }).catch(function(err){
    res.send(500);
  });
});

function renderNewLoanForm(req, res, next, loan, errors){
  Promise.all([Book.findAll(),Patron.findAll()]).then(function(data){
    console.log(data);
    res.render(
      "loans/new",
      {
        loan: loan,
        books: data[0],
        patrons:data[1],
        button_text: "Create New Loan",
        title: "New Loan",
        errors: errors
      }
    );
  }).catch(function(err){
    res.send(500);
  })
}


// Before displaying the new loan form,
// 1. the checked out book ids are fetch with Loan.getLoans("checkedout") then listed in "checkedoutBookIds"
// 2. all books are filtered with checkedoutBookIds and we get the "availableBooks" array
// 3. all patrons are fetched and listed in "patrons"
// 4. "availableBooks" and "patrons" are sent to the new loan form for the selectors
router.get('/new', function(req, res, next) {
  let loan = Loan.build();
  let now = new Date();
  loan.loaned_on = dateFormat(now, "yyyy-mm-dd");
  var returnBy = new Date();
  loan.return_by = dateFormat(returnBy.setDate(now.getDate() + 7), "yyyy-mm-dd");
  renderNewLoanForm(req, res, next, loan, null);
});

function renderReturnLoanForm(req, res, next, errors){
  Loan.getCheckedOutLoan(req.params.id).then(function(loan){
    if(loan){
      let now = new Date();
      loan.returned_on = dateFormat(now, "yyyy-mm-dd");
      let { Book, Patron } = loan.dataValues;
      res.render(
        "loans/return",
        {
          redirect_route:`/loans/${req.params.id}/return`,
          loan: loan,
          book: Book.dataValues,
          patron: Patron.dataValues,
          button_text: "Return book",
          errors: errors
        }
      );
    }else{
      res.send(404);
    }
  }).catch(function(err){
    res.send(500);
  });
}

// can only return a loan that has no returned_on date
// therefor using Loan.getCheckedOutLoan to retrieve a loan
router.get("/:id/return", function(req, res, next){
  renderReturnLoanForm(req, res, next, null);
});

/* PUT update article. */
router.put("/:id/return", function(req, res, next){
  Loan.findById(req.params.id).then(function(loan){
    if(loan){
      return loan.update(req.body);
    }else{
      res.send(404);
    }
  }).then(function(loan){
      res.redirect("/loans");
  }).catch(function(err){
    if(err.name === "SequelizeValidationError"){
        renderReturnLoanForm(req, res, next, err.errors);
    }else{
      throw err;
    }
  }).catch(function(err){
    res.send(500);
  });
});

module.exports = router;
