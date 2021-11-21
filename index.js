

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
  }else{

    res.end("INVALD URL");
    
  }



});

// start the server listening for requests
app.listen(process.env.PORT || 3001, () => console.log('Server is running...'));
