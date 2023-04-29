
const config = require('./database.js');
const confi2 = require('./game_handlers.js');

// node.js express

console.log("loading..");
const express = require('express');
const app = express();

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for service endpoints
let apiRouter = express.Router();
app.use(`/api`, apiRouter);


// Router for game rendering
let gameRouter = express.Router();
apiRouter.use(`/game`, gameRouter);

// Get new game events
gameRouter.post("/create",(req, res) => {
  let game = confi2.generateNewGame();// create an associated game id and game with the right details
  // send the game info

  // add player 
  game.addPlayer(req.body.player);
  
  console.log(`Game created (${game.id})`);
  return res.send({gameId:game.id});

  // res.send({body:"test"});
  // update game info everytime a player joins/leaves/loses connection
});

gameRouter.get("/info/:gameId", (req, res) => {
  if (!confi2.isActiveGameId(req.params.gameId)) 
    res.status(400).send({ msg:`GameId '${req.params.gameId} does not match any existing games!`});
  // send relevant game info
  res.send(confi2.getGameById(req.params.gameId).getInfo());
});

gameRouter.post("/join/:gameId", (req, res) => {
  if (!confi2.isActiveGameId(req.params.gameId)) 
    res.status(400).send({ msg:`GameId '${req.params.gameId} does not match any existing games!`});
  if (!req.body.player) 
    res.status(400).send({ msg:`Missing Player Id`});
    // 0. check that request to join game is valid
  // 1. update game
  // 2. send confimration back?? > probably game info
  let game = confi2.getGameById(req.params.gameId);
  game.addPlayer(req.body.player);
  console.log(game.getTime()+0+0+0+0+0+0+0);
  
  console.log(`${req.body.player} successfully joined the game`);
  res.status(200).send({t:game.getTime(), msg:`${req.body.player} successfully joined the game`});
});

// gameRouter.post("/begin/:gameId", (req, res) => {
//   if (!isActiveGameId(req.params.gameId)) 
//     res.status(400).send({ msg:`GameId '${req.params.gameId} does not match any existing games!`});
//   // un halts the other get calls to begin game, sends the game info to the players
//   res.send(scores);
// });

// gameRouter.get("/update/:gameId", (req, res) => {
//   if (!confi2.isActiveGameId(req.params.gameId)) 
//     res.status(400).send({ msg:`GameId '${req.params.gameId} does not match any existing games!`});
//   if (!req.body.player) 
//     res.status(400).send({ msg:`Missing Player Id`});
//     // 1. check that the other player's game hash matches
//   let game = confi2.getGameById(req.params.gameId);

//   // 2. send all the bits that it is missing ... for now, just the current state
//   res.send(game.getCurrentFrame());
// });

// publish input from this machine
gameRouter.post("/update/:gameId", (req, res) => {
  // NOT YET IMPLEMENTED
  // 1. update game
  // 2. check players game hash
  // 3. send all missing information
  // console.log(req);
  if (!confi2.isActiveGameId(req.params.gameId)) {
    return res.status(400).send({ msg:`GameId '${req.params.gameId}' does not match any existing games!`});
  }
  if (!req.body.player) {
    return res.status(400).send({ msg:`Missing player id.`});

  }
  if (!req.body.frame) {
    return res.status(400).send({ msg:`Missing player data.`});
  }

  let game = confi2.getGameById(req.params.gameId);
  game.updateFrame(req.body.player, req.body.frame);

  let result = game.getCurrentFrames();
  // console.log(result);
  res.send(result);
});



let userRouter = express.Router();
apiRouter.use(`/profile`, userRouter);

// Get profile information -> basically, log in
userRouter.get('*', (_req, res) => {
  res.send(scores);
});

// Update profile information
userRouter.post('*', (req, res) => {
  scores = updateScores(req.body, scores);
  res.send(scores);
});



// Return the application's default page if the path is unknown
app.use((_req, res) => {
  console.log("got basic file");
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});









