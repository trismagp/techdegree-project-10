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
  })
});

/* POST create article. */
router.post('/', function(req, res, next) {
  Patron.create(req.body).then(function(patron){
    res.redirect(`/patrons/${patron.id}`);
  });
});

/* Create a new article form. */
router.get('/new', function(req, res, next) {
  res.render("patrons/new", {patron: Patron.build(), button_text: "Create New Patron", title: "New Patron"});
});

/* Edit article form. */
router.get("/:id/edit", function(req, res, next){
  Patron.findById(req.params.id).then(function(patron){
    Loan.findAll({ include: [{model:Book}], where: {patron_id:req.params.id}}).then(function(loans){
      res.render("patrons/edit", {patron: patron, loans: loans, button_text: "Save", title: `${patron.first_name} ${patron.last_name}`});
    });
  });
});


/* GET individual article. */
router.get("/:id", function(req, res, next){
  Patron.findById(req.params.id).then(function(patron){
    Loan.findAll({ include: [{model:Book}], where: {patron_id:req.params.id}}).then(function(loans){
      res.render("patrons/show", {patron: patron, loans: loans, button_text: "Edit", title: `${patron.first_name} ${patron.last_name}`});
    });
  });
});

/* PUT update article. */
router.put("/:id", function(req, res, next){
  Patron.findById(req.params.id).then(function(patron){
    return patron.update(req.body);
  }).then(function(patron){
      res.redirect("/patrons/" + patron.id);
  });
});


router.put("/:patronId/loans/:loanId/return", function(req, res, next){
  Loan.findById(req.params.loanId).then(function(loan){
    return loan.update(req.body);
  }).then(function(book){
    res.redirect("/patrons/" + req.params.patronId);
  });
});

router.get("/:patronId/loans/:loanId/return", function(req, res, next){
  Loan.getLoans("checkedout").then(function(checkedoutLoans){
    let loan = checkedoutLoans.filter(loan => loan.dataValues.Patron.dataValues.id === parseInt(req.params.patronId))[0];
    let { Book, Patron} = loan.dataValues;
    res.render("loans/return", {redirect_route:`/patrons/${req.params.patronId}/loans/${req.params.loanId}/return`, loan: loan, book: Book, patron: Patron, button_text: "Return book", title: "Return book"});
  });
});


module.exports = router;
