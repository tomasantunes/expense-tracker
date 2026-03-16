var express = require('express');
var router = express.Router();
var database = require('../libs/database');
var categories = require('../libs/categories');
var secretConfig = require('../secret-config');

var { con, con2 } = database.getMySQLConnections();

router.get('/login', (req, res) => {
  var token = req.query.token;
  if (token === secretConfig.LOGIN_TOKEN) {
    req.session.isLoggedIn = true;
    res.redirect('/');
  } else {
    res.status(401).send('Invalid Authorization');
  }
});

router.get('/', function(req, res, next) {
  if (!req.session.isLoggedIn) {
    return res.status(401).send('Invalid Authorization');
  }
  res.render('index');
});

router.post('/add-expense', async (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.render('add-expense', { message: 'Invalid Authorization' });
  }

  var { amount, category_id, category_name } = req.body;

  if (!amount) {
    return res.render('add-expense', { message: 'Amount is required' });
  }

  if (!category_id && !category_name) {
    return res.render('add-expense', { message: 'Category is required' });
  }

  if (category_id === 'new' && category_name != '') {
    category_id = await categories.checksertCategory(category_name);
  }

  const query = 'INSERT INTO expense_tracker (amount, category_id) VALUES (?, ?)';
  con.query(query, [amount, category_id], (err, result) => {
    if (err) {
      console.log('Error inserting expense:', err);
      return res.render('add-expense', { message: 'Error adding expense to database.' });
    }

    res.render('add-expense', { message: 'Expense added successfully!' });
  });
});

router.get('/get-categories', (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.json({ status: "NOK", error: 'Invalid Authorization' });
  }

  const query = 'SELECT id, name FROM expense_categories';

  con.query(query, (err, result) => {
    if (err) {
      console.log('Error fetching categories:', err);
      return res.json({ status: "NOK", error: 'Error fetching categories from database.' });
    }

    res.json({ status: "OK", data: result });
  });
});
module.exports = router;
