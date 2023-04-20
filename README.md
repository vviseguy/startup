## Required Class Notes

### Things I have learned in the Simon project

* I don't like doing html without css - even when focusing just on structure. I like to be able to center things, and arrange things using 
`display: grid;`.
* That I can spend way too much time on css...
* `box-sizing: border-box;` is a very useful change to make.
* Box-shadows have a lot of applications
* I got to see how async and await functions work better, its starting to make more sense.
* It was also cool to see how local storage storage works hands on.
* I was surprized at how easy it was to make and coontrol a mongdb database - I had troubel with the password part, but resetting it did the trick. I learned that changing systems is about as hard as the amount of times you reference that system and taht abstraction in your code (calling a function or group of functions that handle the database access) can help make that transition easier.

# Startup

The full-stack startup project that I would like to persue is an Inversus-style multiplayer online game. 

![gameplay](https://user-images.githubusercontent.com/16418680/221054342-883386e7-b975-4f48-bece-27991c4dc222.png)

## The Premise

The game is a one-player or multiplayer game. The goal is to survive as long as possible. Players may shoot, and move in 2 dimensions. 
The classic mode would be cooperative in nature; the player(s) defend against spawning enemies that can move and interect similarly to the players.
The score is a function of enemies destroyed and time survived.

Basic data such as high score will be saved to a user's account.

For those not familiar with _Inversus_, know that it is a minimalistic cross platform game, not yet avaliable on the browser. 
Click here for more information/gameplay: https://www.inversusgame.com/

## Feature TO-DO List

### Game feautes

1. enemy spawning
1. enemy ai 
1. collisions
1. scorekeeping

### Features pending covering the technology in class

1. user login and data storage
1. global scoreboard
1. game set-up and joinging over the internet

### Layout features

1. giving the game a definite color scheme
1. making the background a fuzzed-out gif of gameplay

## Website Layout

![startup-website-diagram](https://user-images.githubusercontent.com/16418680/215299820-4a4aea2d-b974-4d44-821e-2396f08a4621.png)

## Current Bugs

*  On mobile devices, input lags. 
  I don't know if this is because of the nature of js events or because of the amount of code that is running. It appears that the amount of code fun on each input event is less than a 100 lines.

## Forseeable Challenges

As is the biggest challenge will likely be keeping both (or all) players interacting with eachother in real time. I would like to minimize traffic to the server and back, so I will have to ensure that the client-side renderer is *extrememely* consistant. To the point of rendering the same pixel-perfect output regaurdless of the frame rate of the cient computers.

I anticipate that live connection, score keeping, login and the other tests I do not now know how to hande will be addressed as I go through the course.

## Other Features

* setting a color pallette
* life regeration 
* power-ups
* more robust collisions to allow for a moving environment
