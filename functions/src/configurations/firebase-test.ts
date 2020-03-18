import * as functions from "firebase-functions-test";
const path = require("path");

export const testEnv = functions({
    databaseURL: "https://winnr-feed.firebaseio.com",
    projectId: "winnr-feed",
    storageBucket: "winnr-feed.appspot.com",   
}, path.resolve("src/configurations/adminsdk.json"));
// const test = require("firebase-functions-test")({
//     databaseURL: "https://winnr-feed.firebaseio.com",
//     projectId: "winnr-feed",
//     storageBucket: "winnr-feed.appspot.com",
// },path.resolve("adminsdk.json"));