const express = require('express'),
bodyParser = require('body-parser'),
uuid = require('uuid'),
morgan = require('morgan'),
fs = require('fs'),
path = require('path');

const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myflixDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');


//fs.createWriteStream is used to create a write stream while path.join appends it to log,txt file
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('common', {stream: accessLogStream}));
app.use(express.static('public'));

//default text response
app.get('/', (req, res) => {
  res.send('Welcome to MyFlix!');
});

// get all movies and return json object
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});


// get movies by title
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ Title: req.params.title})
  .then((movie) => {
    res.status(200).json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Get genre by Name
app.get('/movies/genres/:Name', (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.Name})
  .then((movies) => {
    res.send(movies.Genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


//Get director data by Name
app.get('/movies/directors/:Name', (req, res) => {
  console.log(req.query.Name)
  Movies.findOne({"Director.Name": req.params.Name})
  .then((movies) => {
    res.send(movies.Director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Get all user (Read in Mongoose)
app.get('/users', (req, res) => {
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Get a user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username})
  .then((User) => {
    res.status(200).json(User)
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err)
  })
})

// // Allow new users register (create)
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + ' already exists');
    } else {
      Users
      .create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then((user) =>{res.status(201).json(user) })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

// Allow users update their user info (Update)
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username},
    { $set:
      {
        Username: req.body.Username,
        Passworf: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    {new: true }, //This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

  // Allow users add to their list of Favorites (create)
  app.post('/users/:Username/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
      $push: { FavoriteMovies: req.params.MovieID }
    },
    { new: true}, //This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  } );

  //Delete movie from favorite list
  app.delete('/users/:Username/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username}, {
      $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

  //Allow existing users deregister
  app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if(!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.' );
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', {root: __dirname});
  });

  //error handling middleware function
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!')
  });

  app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
  });