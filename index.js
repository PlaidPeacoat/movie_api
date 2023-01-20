const express = require('express');
const morgan = require('morgan');
const app = express();

const fs = require('fs');
const path = require ('path');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a',});

//using morgan instead of mylogger function
app.use(morgan('common', {stream: accessLogStream}));
//allows the return of multiple files in response to requests
app.use(express.static('public'));

let myMovies = [
  {
    title: 'Good Will Hunting',
    producer: 'Lawrence Bender',
    director: 'Gus Van Sant',
    release: '1997',
    starring: 'Matt Damon, Robin Williams, Ben Affleck'
  },
  {
    title: 'Mrs. Doubtfire',
    producer: 'Robin Williams, Mark Radcliffe, Marsha Garces Williams',
    director: 'Chris Columbus',
    release: '1993',
    starring: 'Robin Williams, Sally Field, Pierce Brosnan'
  },
  {
    title: 'The Birdcage',
    producer: 'Mike Nichols',
    director: 'Mike Nichols',
    release: '1996',
    starring: 'Robin Williams, Nathan Lane, Gene Hackman'
  },
  {
    title: 'Avatar',
    producer: 'James Cameron',
    director: 'James Cameron',
    release: '2009',
    starring: 'Zoe Saldana, Sam Worthington, Sigourney Weaver'
  },
  {
    title: 'The Iron Giant',
    producer: 'Allison Abbate, Des McAnuff',
    director: 'Brad Bird',
    release: '1999',
    starring: 'Vin Diesel, Eli Marienthal, Jennifer Aniston'
  },
  {
    title: 'Queen & Slim',
    producer: 'Malina Matsoukas, Lena Waithe',
    director: 'Melina Matsoukas',
    release: '2019',
    starring: 'Daniel Kaluuya, Jodie Turner-Smith, Bokeem Woodbine'
  },
  {
    title: 'Only',
    producer: 'Eyal Rimmon, Gabrielle Pickle',
    director: 'Takashi Doscher',
    release: '2019',
    starring: 'Freida Pinto, Leslie Odom Jr.'
  },
  {
    title: 'Inglourious Basterds',
    producer: 'Lawrence Bender',
    director: 'Quentin Tarantino',
    release: '2009',
    starring: 'Christoph Waltz, Brad Pitt, Eli Roth'
  },
  {
    title: 'Django Unchained',
    producer: 'Reginald Hudlin, Stacey Sher, Pilar Savone, Harvey Weinstein, Bob Weinstein, Quentin Tarantino',
    director: 'Quentin Tarantino',
    release: '2012',
    starring: 'Christoph Waltz, Jamie Foxx, Leonardo DiCaprio'
  },
  {
    title: 'O Brother, Where Art Thou?',
    producer: 'Joel Coen, Ethan Coen',
    director: 'Joel Coen, Ethan Coen',
    release: '2000',
    starring: 'George Clooney, John Turturro, Tim Blake Nelson, John Goodman'
  },
];

/* GET requests */
app.get("/movies", (req, res) => {
    res.json(myMovies);
  });
  
  /* res.send object replaces response.writeHead and response.end code */
  app.get("/", (req, res) => {
    res.send("Welcome to the Movie Find App!");
  });
  
  /* error handler comes after all route calls and app.use but before app.listen */
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("It's not working right now!");
  });
  
  /* listen for requests, replaces http.createServer code */
  app.listen(8080, () => {
    console.log("Your app is listening on port 8080.");
  });
  