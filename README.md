# matching
This is a memory matching game that I wrote as an exercise to learn Node.js and web accessibility APIs. You can see it live [here](http://www.zahniser.net/matching).

## Licensing
The source code (js, html, and css) is all my original work and is free to use however you wish. The images may be copyrighted by their respective authors; see about.html for details.

## Developers
If you'd like to fork your own version of the app and run it yourself, what I am doing is using [Heroku](http://heroku.com) to host the server; their free account is more than sufficient. After installing the Heroku CLI tools you would just do:
```bash
git clone https://github.com/rzahniser/matching.git
cd matching
heroku create
git push heroku master
heroku open
```
The server can serve the full app, but in order to maximize how many clients the server can handle, I moved the static files to an ordinary web hosting provider. There is a Node.js build script to minify and export the files:
```bash
npm install
npm run build
scp -r dist [location on server]
```
For local testing, you can just run the node server locally:
```bash
npm start
```