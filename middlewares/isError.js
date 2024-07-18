// /middlewares/errorHandler.js
module.exports = (err, req, res, next) => {
    console.error(err.stack);
  
    res.status(err.status || 500);
    res.format({
      'text/plain': () => {
        res.send(err.message);
      },
      'text/html': () => {
        res.render('error', { error: err });
      },
      'application/json': () => {
        res.json({ error: err.message });
      }
    });
  };
  