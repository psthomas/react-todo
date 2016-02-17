## react-todo

This is a todo app written with React.js.  It uses Node and Express for the server and a JSON file as a simple local database.  Ajax queries are used throughout to update the database based on changes in state.  A demo without the backend is running [here](http://psthomas.github.io/react-todo/). 

Note: Babel and React are loaded as inline scripts in index.html rather than converting and rendering server side.  

### Run locally

To run locally, clone this repo, install the requirements in package.json with npm, and run the server using Node: 

```
$ git clone https://github.com/psthomas/react-todo
$ cd path/to/clone
$ npm init
$ node server.js
```

Then visit http://localhost:3000/ to view the running app.  