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

router.post('/edit-expense', (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.json({ status: "NOK", error: 'Invalid Authorization' });
  }

  var { id, amount, category_id, category_name } = req.body;

  if (!id || !amount) {
    return res.json({ status: "NOK", error: 'ID and Amount are required' });
  }

  if (!category_id && !category_name) {
    return res.json({ status: "NOK", error: 'Category is required' });
  }

  if (category_id === 'new' && category_name != '') {
    categories.checksertCategory(category_name).then(newCategoryId => {
      updateExpense(id, amount, newCategoryId);
    }).catch(err => {
      console.log('Error checking/inserting category:', err);
      return res.json({ status: "NOK", error: 'Error processing category.' });
    });
  } else {
    updateExpense(id, amount, category_id);
  }

  function updateExpense(id, amount, categoryId) {
    const query = 'UPDATE expense_tracker SET amount = ?, category_id = ? WHERE id = ?';
    con.query(query, [amount, categoryId, id], (err, result) => {
      if (err) {
        console.log('Error updating expense:', err);
        return res.json({ status: "NOK", error: 'Error updating expense in database.' });
      }

      res.json({ status: "OK", message: 'Expense updated successfully!' });
    });
  }
});

router.post('/delete-expense', (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.json({ status: "NOK", error: 'Invalid Authorization' });
  }

  var { id } = req.body;

  if (!id) {
    return res.json({ status: "NOK", error: 'ID is required' });
  }

  const query = 'DELETE FROM expense_tracker WHERE id = ?';
  con.query(query, [id], (err, result) => {
    if (err) {
      console.log('Error deleting expense:', err);
      return res.json({ status: "NOK", error: 'Error deleting expense from database.' });
    }

    res.json({ status: "OK", message: 'Expense deleted successfully!' });
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

router.get('/list-expenses', (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.send('Invalid Authorization');
  }

  const query = `
    SELECT e.id, e.amount, c.name AS category_name, e.created_at
    FROM expense_tracker e
    JOIN expense_categories c ON e.category_id = c.id
    ORDER BY e.created_at DESC
  `;

  con.query(query, (err, result) => {
    if (err) {
      console.log('Error fetching expenses:', err);
      return res.send('Error fetching expenses from database.');
    }

    res.render('list-expenses', { expenses: result });
  });
});

module.exports = router;
