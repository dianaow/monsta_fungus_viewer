// load all env variables from .env file into process.env object.
require('dotenv').config()

var express = require('express');
var cors = require('cors');
const path = require("path")
var app = express();
app.use(cors());
app.use(express.json()) 
const PORT = process.env.PORT || 3000

const Pool = require('pg').Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )

  next()
})

async function addVote(req) {
  let result = req.body
  await pool.query(`INSERT INTO votes (seed, timestamp, timezone) VALUES($1,$2,$3)`, [result.seed, result.timestamp, result.timezone], 
    (err, res) => {
      if (err) {
        throw err
      }
    }
  );
}

function getAllVotes(res) {
  pool.query('SELECT * FROM votes', (err, results) => {
    if (err) {
      throw err
    }
    res.send(results.rows)
  })
}

app.post('/api/add_vote', async function (req, res) {
  await addVote(req)
});

app.get('/api/votes', function (req, res) {
  getAllVotes(res)
});

app.use(express.static(path.join(__dirname, "/dist")))

app.listen(PORT, "0.0.0.0", function onStart(err) {
  if (err) {
    console.log(err)
  }
  console.info(
    "==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.",
    PORT,
    PORT
  )
})
