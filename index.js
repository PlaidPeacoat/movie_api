const express = require('express'),
      //framework providing a broad set of features for the building of web and mobile apps
      morgan = require('morgan'),
      //middleware for loggin http requests
      bodyParser = require('body-parser'),
      //middleware for allowing access to req.body from within routes to use that data. used when more than just the URL is hit (body data being sent)
      Models = require('./models'),
      fs = require('fs'),
      //used to write server activity to a log file
      path = require('path'),
      //helps to route traffic logs
      passport = require('passport'),
      cors = require('cors');
      require('./passport')
const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});
const { check, validationResult } = require('express-validator');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
//The default setting of the above allows requests from all origins
let auth = require('./auth')(app);
const mongoose = require('mongoose');
const { format } = require('path');

mongoose.connect('mongodb://localhost:27017/myflixDB', { useNewUrlParser: true, useUnifiedTopology: true });
const Movies = Models.Movie;
const Users = Models.User;

app.use(morgan('common'));
app.use(morgan('combined', {stream: accessLogStream}));
const myLogger = (req, res, next) => {
  console.log(req.url);
  next();
};
const requestTimeStamp = (req, res, next) => {
  req.requestTimeStamp = Date.now();
  next();
}
app.use(myLogger);
app.use(requestTimeStamp);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

//homepage welcome, first endpoint
app.get('/', (req, res) => {
  res.send('Welcome to MyFlix!');
});
//sets directory from which to serve static files
app.use(express.static('public'));
/* 1. GETs list of all movies */

app.get('/movies', (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send('Error: ' + err);
  });
});
/* 2. GETs specific movie data by title */
app.get('/movies/:Title', (req, res) => {
  Movies.findOne( {Title: req.params.Title} )
  .then((movies) => {
    res.status(201).json(movies)
  })
  .catch((err) => {
    res.status(500).send('Error ' + err);
  });
});

// /* 3. GETs specific movie data by genre */
app.get('/movies/genre/:genreName', (req, res) => {
  //First retrieve the Genre doc with the matching Type:
  Genres.findOne({ Type: req.params.genreName })
  //Then retrrieve movies with matching genre id:
   .then((genre) => {
    movies.find({ Genres: genre.Name })
    .then((movies) => {
      res.status(200).json(movies)
    })
    .catch((err) => {
      res.status(500).send('Error ' + err);
     });
    })
  });

// /* 4. GETs specific movie data by director */
app.get('/movies/director/:directorName', (req, res) => {
  // First retrieve the Director doc with the matching name:
  Directors.findOne({ Name: req.params.directorName })
    .then((director) => {
      // Then retrieve all movies with matching director id:
      movies.find({ Director: director.Name })
        .then((movies) => {
          res.status(200).json(movies);
        })
        .catch((err) => {
          res.status(500).send(`Error: ${err}`);
        });
    })
    ////Second error catch for the movies search
    .catch((err) => {
      res.status(500).send(`Error: ${err}`);
    });
});
//get all users
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

/* 5. POST: allows new users to register  */
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
  .then ((user) => {
    if(user) {
      return res.status(400).send(req.body.Username + 'already exists');
    } else{
      Users
      .create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
    })
    .then((user) => {res.status(201).json(user) })
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

/* 6. PUT: allows user to update their userinfo */

// Get a user by username
//Find User by iD
app.get('/users/id/:id', (req, res) => {
  Users.findOne( { _id: req.params.id} )
  .then((user) => {
    if(user) {
      res.json(user);
    } else {
      res.status(404).send('No such user.')
    }
  })
  .catch((err) => {
    res.status(500).send('Error: ' + err);
  });
});

//Update User Info
app.put('/users/:Name', (req, res) => {
  Users.findOneAndUpdate( {Name: req.params.Name}, { $set:
    {
      Name: req.body.Name,
      Email: req.body.Email,
      Password: req.body.Password,
      Birthday: req.body.Birthday
    }
  },
  //ensures the new doc is returned:
  { new: true },
  (err, udpatedUser) => {
    if(err) {
      console.log(err);
      res.status(500).send('Error ' + err);
    } else {
      res.json(udpatedUser);
    }
  });
});


//Add a Favorite movie to User's Favorites by name
app.post('/users/:Username/movies/:movieTitle', (req, res) => {
  Users.findOneAndUpdate( { Name: req.params.Username },
    { $addToSet: { Favorites: req.params.movieTitle } },
    { new: true },
    (err, udpatedUser) => {
      if(err) {
        console.log(err);
        res.status(500).send('Error ' + err)
      } else {
        console.log('Added only if movie does not already exist.')
        res.status(200).json(udpatedUser);
      }
    }
    );
});

//Add movie to user favorites by movie iD
app.post('/users/:Username/movies/:movieId', (req, res) => {
  Users.findOneAndUpdate( { Name: req.params.Username },
    { $addToSet: { Favorites: req.params.movieId } },
    { new: true },
    (err, udpatedUser) => {
      if(err) {
        console.log(err);
        res.status(500).send('Error ' + err)
      } else {
        console.log('Added only if movie does not already exist.')
        res.status(200).json(udpatedUser);
      }
    }
    );
});

//Delete a Favorite movie from User's Favorites by name
app.delete('/users/:Username/movies/:movieTitle', (req, res) => {
  Users.findOneAndUpdate( { Name: req.params.Username },
    { $pull: { Favorites: req.params.movieTitle } },
    { new: true },
    (err, udpatedUser) => {
      if(err) {
        console.log(err);
        res.status(500).send('Error ' + err)
      } else {
        res.json(udpatedUser);
      }
    }
    );
});

//Delete Favorite movie from user favorites by movie iD
app.delete('/users/:Username/movies/:movieId', (req, res) => {
  Users.findOneAndUpdate( { Name: req.params.Username },
    { $pull: { Favorites: req.params.movieId } },
    { new: true },
    (err, udpatedUser) => {
      if(err) {
        console.log(err);
        res.status(500).send('Error ' + err)
      } else {
        console.log('Added if new movie.')
        res.json(udpatedUser);
      }
    }
    );
});


//Delete a User by Username "De-Register"
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Name: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Delete User by User iD
app.delete('/users/id/:id', (req, res) => {
  Users.findOneAndRemove( {id: req.params.id })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


/* error handler comes after all route calls and app.use but before app.listen */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('It\'s not working right now!');
  });

/* listen for requests, replaces http.createServer code */
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });



