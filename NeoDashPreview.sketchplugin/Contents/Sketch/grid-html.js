var GridHTML = {};

GridHTML.getHTML = function (context, config, platform) {
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


GridHTML.getCSS = function (context) {
  var sketch = context.api();
  var cssURL = sketch.resourceNamed('neodash.css');
  return GridHTML.readTextFromFile(cssURL);
}

GridHTML.getJS = function (context) {
  var sketch = context.api();
  var jsURL = sketch.resourceNamed('neodash.js');
  return GridHTML.readTextFromFile(jsURL);
}

GridHTML.readTextFromFile = function(filePath) {
    var fileManager = [NSFileManager defaultManager];
    if([fileManager fileExistsAtPath:[filePath path]]) {
        return [NSString stringWithContentsOfFile:[filePath path] encoding:NSUTF8StringEncoding error:nil];
    }
    log('file doesnt exist');
    return nil;
}
