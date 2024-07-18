const { default: mongoose } = require('mongoose');
const dbConnect =  () => {
      const conn = mongoose.connect(process.env.MONGODB_URL)
      .then(() => console.log("Database connected Successfully !"))
      .catch((err) => console.log(err));
}
module.exports = dbConnect; 
