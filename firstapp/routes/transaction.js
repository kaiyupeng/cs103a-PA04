/*
  transaction.js -- Router for the Transactions
*/
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction')
const User = require('../models/User')
const mongoose = require("mongoose");

isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

/* get transaction data and sort */
router.get('/transaction',
  isLoggedIn,
  async (req, res, next) => {
      const sortBy = req.query.sortBy
      let transactions=[]
      if (sortBy == 'category') {
        transactions = await Transaction.find({userId:req.user._id})
                                        .sort({category:1});
      } else if (sortBy == 'amount') {
        transactions = await Transaction.find({userId:req.user._id})
                                        .sort({amount:-1});
      } else if (sortBy == 'description') {
        transactions = await Transaction.find({userId:req.user._id})
                                        .sort({description:1});
      } else if (sortBy == 'date') {
        transactions = await Transaction.find({userId:req.user._id})
                                        .sort({date:-1});
      } else {  // sortBy == null, no need to sort
        transactions = await Transaction.find({userId:req.user._id});
      }
    res.render('transactions',{transactions,sortBy});
});

/* create new transaction */
router.post('/transaction',
  isLoggedIn,
  async (req, res, next) => {
      const transaction = new Transaction(
        {description: req.body.description,
         amount: req.body.amount,
         category: req.body.category,
         date: req.body.date,
         userId: req.user._id
        })
      await transaction.save();
      res.redirect('/transaction')
});

/* delete transaction */
router.get('/transaction/delete/:transactionId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /transaction/delete/:transactionId")
      await Transaction.deleteOne({_id:req.params.transactionId});
      res.redirect('/transaction')
});

/* edit transaction */
router.get('/transaction/edit/:transactionId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /transaction/edit/:transactionId")
      const transaction = 
       await Transaction.findById(req.params.transactionId);
      res.locals.transaction = transaction
      res.render('editTransaction')
});

router.post('/transaction/update/:transactionId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /transaction/update/:transactionId");
      const transactionParams = 
        {description: req.body.description,
         amount: req.body.amount,
         category: req.body.category,
         date: req.body.date,
        }
      await Transaction.findByIdAndUpdate(req.params.transactionId,
        {$set:transactionParams} );
      res.redirect('/transaction')
});

router.get('/transaction/byCategory',
  isLoggedIn,
  async (req, res, next) => {
      let transactions =
            await Transaction.aggregate(
                [   {$match:{'userId': new mongoose.Types.ObjectId(req.user._id)}},
                    {$group:{
                    _id:'$category',
                    amount:{$sum:'$amount'}}
                    },             
                ])
        res.render('groupByCategory',{transactions})
});


module.exports = router;
