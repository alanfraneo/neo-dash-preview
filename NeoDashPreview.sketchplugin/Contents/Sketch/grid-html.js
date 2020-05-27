var GridHTML = {};

GridHTML.getHTML = function (config, platform) {
  var html =
    '<!DOCTYPE HTML><html><head><meta charset=utf-8><title>NeoGallery</title>\
      <link href="/bi/webapp/css/neodash.css" rel="stylesheet" type="text/css" />\
      </head><body class='+platform+'><div id="title"></div>\
      <div id="tabs"></div>\
      <div id="neogallery"></div></body>\
    	<script>var imgconfig = '+config+';</script>\
      <script src="/bi/webapp/js/neodash.js"></script>\
     </html>';
  return html;
};