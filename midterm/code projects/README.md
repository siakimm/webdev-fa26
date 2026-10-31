My p5.js code run on separate pages so their global setup/draw functions do not conflict. The portfolio embeds those pages in iframes. 

Integration changes keep the supplied artwork and comments: 30 fps and pixel density 1, responsive sphere scaling, flexible controls, accessible color labels, touch support, and microphone error/shutoff handling. Clearing the WebGL depth buffer after the trail background keeps the rear of the sphere visible.

The site is opened with VS Code Live Server for local testing. The supplied library is stored locally, so the sketches do not need a CDN connection at runtime.

https://archive.p5js.org/get-started/ and https://p5js.org/reference/p5/windowResized/
Used p5.js refrence to help me