/* const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
const axios = require("axios");
const cheerio = require("cheerio");


const getVideo = async url => {
    // calls axios to go to the page and stores the result in the html variable
    const html = await axios.get(url);
    // calls cheerio to process the html received
    const $ = cheerio.load(html.data);
    // searches the html for the videoString
    const videoString = $("meta[property='og:video']").attr("content");
    // returns the videoString
    return videoString;
  };


  app.post("/api/download", async (request, response) => {
    console.log("request coming in...");
  
    try {
      // call the getVideo function, wait for videoString and store it
      // in the videoLink variable
      const videoLink = await getVideo("https://www.instagram.com/p/BWhyIhRDBCw/");
      // if we get a videoLink, send the videoLink back to the user
      if (videoLink !== undefined) {
        response.json({ downloadLink: videoLink });
      } else {
        // if the videoLink is invalid, send a JSON response back to the user
        response.json({ error: "The link you have entered is invalid. " });
      }
    } catch (err) {
      // handle any issues with invalid links
      response.json({
        error: "There is a problem with the link you have provided."
      });
    }
  });
  
  // our sever is listening on port 3001 if we're not in production
  const PORT = process.env.PORT || 3001;
  
  app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
  
  module.exports = app; */


  const express = require('express');
  const app = express();

  const axios = require('axios');
const { parse } = require("node-html-parser");

var instagramPostLink = "https://www.instagram.com/p/CF2sWwVHxbx/";

let link = "";

async function getPostLink(url) {

  url = url + 'embed' + '/captioned';


  let res = axios.get(url).then(async (response) => {
    const root = parse(response.data);

    if (response.data.search("video_url") != -1)
      link = getVideoLinkFromHtml(response.data);
    else
      link = root.querySelector('img.EmbeddedMediaImage').getAttribute("src");





    while (link.search("&amp;") != -1) {
      link = link.replace("&amp;", "&");
    }
    let caption =await getCaptionFromHtml(response.data);
link=link.replace('"',"")
    return {link,caption};

  });

  return res;

}

async function getCaption(url) {


  url = url + 'embed' + '/captioned';

  let res = axios.get(url).then((response) => {

    let caption= getCaptionFromHtml(response.data);

    return caption;

  });

  return res;

}

async function getCaptionFromHtml(html) {


  const root = parse(html);

  let caption=root.querySelector('.Caption')?.text;
  if(caption == undefined)
      caption="No caption";

  caption=caption.replace("view all comments","");
  return caption;

}

function getVideoLinkFromHtml(html) {
  let crop = "{\"" + html.substring(html.search("video_url"), html.search("video_url") + 1000);

  crop = crop.substring(0, crop.search(",")) + "}";

  return JSON.parse(crop).video_url;
}

(async ()=>{
    await getPostLink(instagramPostLink);
})();




// use the express-static middleware
app.use(express.static('public'));

// define the first route
app.get('/', function (req, res) {
  respp = '';
  res.setHeader('Content-Type', 'application/json');

  var query = require('url').parse(req.url, true).query;

  twUrl = String(query.url)
instagramPostLink =twUrl;



  if (twUrl.includes('instagram')) {

    getPostLink(instagramPostLink).then(Result=>{
      
     res.send(link);

      


      res.end();
    })
  }



});

// start the server listening for requests
app.listen(process.env.PORT || 3001, () => console.log('Server is running...'));