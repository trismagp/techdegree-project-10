var express = require('express');
var router = express.Router();
var Patron = require("../models").Patron;
var Book = require("../models").Book;
var Loan = require("../models").Loan;
var dateFormat = require('dateformat');



/* GET articles listing. */
router.get('/', function(req, res, next) {
  Patron.findAll().then(function(patrons){
    res.render("patrons/index", {patrons: patrons, title: "Patrons"});
  }).catch(function(err){
    res.send(500);
  });
});

/* POST create article. */
router.post('/', function(req, res, next) {
  Patron.create(req.body).then(function(patron){
    res.redirect(`/patrons/${patron.id}`);
  }).catch(function(err){
    if(err.name === "SequelizeValidationError"){
        res.render("patrons/new", {patron: Patron.build(req.body), button_text: "Create New Patron", title: "New Patron" , errors: err.errors});
    }else{
      throw err;
    }
  });
});

/* Create a new article form. */
router.get('/new', function(req, res, next) {
  res.render("patrons/new", {patron: Patron.build(), button_text: "Create New Patron", title: "New Patron"});
});

/* Edit article form. */
router.get("/:patronId/edit", function(req, res, next){
  Patron.findById(req.params.patronId).then(function(patron){
    if(patron){
      Loan.getPatronLoans(req.params.patronId).then(function(loans){
        res.render("patrons/edit", {patron: patron, loans: loans, button_text: "Save", title: `${patron.first_name} ${patron.last_name}`});
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
router.get("/:patronId", function(req, res, next){
  Patron.findById(req.params.patronId).then(function(patron){
    if(patron){
      Loan.getPatronLoans(req.params.patronId).then(function(loans){
        res.render("patrons/show", {patron: patron, loans: loans, button_text: "Edit", title: `${patron.first_name} ${patron.last_name}`});
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
router.put("/:patronId", function(req, res, next){
  Patron.findById(req.params.patronId).then(function(patron){
    if(patron){
      return patron.update(req.body);
    }else{
      res.send(404);
    }
  }).then(function(patron){
      res.redirect("/patrons/" + patron.id);
  }).catch(function(err){
    if(err.name === "SequelizeValidationError"){
        var patron = Patron.build(req.body);
        patron.id = req.params.patronId;
        console.log(patron);
        Loan.getPatronLoans(req.params.patronId).then(function(loans){
          res.render("patrons/edit", {patron: patron, loans: loans, button_text: "Save", title: `${patron.first_name} ${patron.last_name}`, errors: err.errors});
        }).catch(function(err){
          res.send(500);
        });
    }else{
      throw err;
    }
  });
});


router.put("/:patronId/loans/:loanId/return", function(req, res, next){
  Loan.findById(req.params.loanId).then(function(loan){
    if(loan){
      return loan.update(req.body);
    }else{
      res.send(404);
    }
  }).then(function(book){
    res.redirect("/patrons/" + req.params.patronId);
  }).catch(function(err){
    if(err.name === "SequelizeValidationError"){
      renderReturnPatronLoanForm(req, res, next, err.errors);
    }else{
      throw err;
    }
  }).catch(function(err){
    res.send(500);
  });
});

function renderReturnPatronLoanForm(req, res, next, errors){
  Loan.getCheckedOutLoan(req.params.loanId).then(function(loan){
    if(loan){
      let now = new Date();
      loan.returned_on = dateFormat(now, "yyyy-mm-dd");
      let { Book, Patron} = loan.dataValues;
      res.render(
        "loans/return",
        {
          redirect_route:`/patrons/${req.params.patronId}/loans/${req.params.loanId}/return`,
          loan: loan,
          book: Book,
          patron: Patron,
          button_text: "Return book",
          title: "Return book",
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

router.get("/:patronId/loans/:loanId/return", function(req, res, next){
  renderReturnPatronLoanForm(req, res, next, null);
});


module.exports = router;
