/* importing all needed packages locally */
const express = require('express');
const morgan = require('morgan');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");
const uuid = require("uuid");
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

/* invoking morgan, instead of myLogger() function */
app.use(morgan('common', {
  stream: fs.createWriteStream('./log.txt.log', {flags: 'a'})
}));
app.use(morgan('dev'));

/* allows the return of multiple static files in response to a request */
app.use(express.static('public'));
app.use(bodyParser.json());

let users = [
  {
    "id": "1.1",
    "name": "John",
    "favoriteMovie": []
  },
  {
    "id": "1.2",
    "name": "Sarah",
    "favoriteMovie": ["Kill Bill"],
  }
];

let movies = [
    {
      "title": "2001: A Space Odyssey",
      "description": "describe movie",
      "release": "1968",
      "genre": {
        "name": "comedy",
        "description": "placeholder description",
      },
      "director": {
        "name": "placeholder",
        "bio": "placeholder bio",
        "birth year": "1970",
        "death year": "2023",
      },
      "imageUrl": "link to image URL",
      "featured":false
    },
    {
      "title": "The Godfather",
      "description": "describe movie",
      "release": "1972",
      "genre": {
        "name": "thriller",
        "description": "placeholder description",
      },
      "director": {
        "name": "placeholder",
        "bio": "placeholder bio",
        "birth year": "1970",
        "death year": "2023",
      },
      "imageUrl": "link to image URL",
      "featured":false
    },
    {
      "title": "Citizen Kane",
      "description": "describe movie",
      "release": "1941",
      "genre": {
        "name": "comedy",
        "description": "placeholder description",
      },
      "director": { 
        "name": "placeholder",
        "bio": "placeholder bio",
        "birth year": "1970",
        "death year": "2023",
      },
      "imageUrl": "link to image URL",
      "featured":false
    },
    {
      "title": "Raiders of the Lost Ark",
      "description": "describe movie",
      "release": "1981",
      "genre": {
        "name": "thriller",
        "description": "placeholder description",
      },
      "director": {
        "name": "placeholder",
        "bio": "placeholder bio",
        "birth year": "1970",
        "death year": "2023",
      },
      "imageUrl": 'link to image URL',
      "featured": 'false'
    },
    {
      "title": "La Dolce Vita",
      "description": "describe movie",
      "release": "1960",
      "genre": {
        "name": "comedy",
        "description": "placeholder description",
      },
      "director": {
        "name": "placeholder",
        "bio": "placeholder bio",
        "birth year": "1970",
        "death year": "2023",
      },
      "imageUrl": "link to image URL",
      "featured":false
    }
  
  ];

/* res.send object replaces response.writeHead and response.end code */
app.get('/', (req, res) => {
  res.send('Welcome to MyFlix Movie App!');
});

/* 1. GETs list of all movies */
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
  });

/* 2. GETs specific movie data by title */
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.title === title );

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('this movie doesn\'t exist!')
  }
})

/* 3. GETs specific movie data by genre */
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.genre.name === genreName ).genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('this genre doesn\'t exist!')
  }
})

/* 4. GETs specific movie data by director */
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.director.name === directorName ).director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('this director doesn\'t exist!')
  }
})

/* 5. POST: allows new users to register  */
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('user name required');
  }
})

/* 6. PUT: allows user to update their userinfo */

app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updateUser = req.body;
  /* only use 2 = rather than 3 = as user.id is a number but id is  a string */
  let user = users.find( user => user.id == id );

  if (user) {
    user.name = updateUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('user name not found')

  }
})

/* 7. POST: allow users to add a movie to their favourites   */

app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  
  /* only use 2 = rather than 3 = as user.id is a number but id is  a string */
  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovie.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('user name not found')

  }
})

/* 8. DELETE: allow users to remove a movie from their favourites */

app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  
  /* only use 2 = rather than 3 = as user.id is a number but id is  a string */
  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovie = user.favoriteMovie.filter( title => title !== movieTitle )
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('user name not found')

  }
})

/* 9. DELETE: allow users to de-register */

app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  
  /* only use 2 = rather than 3 = as user.id is a number but id is  a string */
  let user = users.find( user => user.id == id );

  if (user) {
    users = users.filter( user => user.id != id )
    res.status(200).send(` user ${id} has been successfully deleted `);
  } else {
    res.status(400).send('user name not found')

  }
})




/* error handler comes after all route calls and app.use but before app.listen */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('It\'s not working right now!');
  });

/* listen for requests, replaces http.createServer code */
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });



