@import './fs-utils.js';
@import './grid-html.js';

/**
function for exporting all artboards from all pages except, Symbols, Styles and pages beginning with _
the scaling of each artboard is forced to 8x.
*/
var exportAllPagesios8x = function (context) {
  exportAllPages(8, 'ios');
}
/**
function for exporting all artboards from current page.
the scaling of each artboard is forced to 8x.
*/
var exportCurrentPageios8x = function (context) {
  exportCurrentPage(8, 'ios');
}
/**
function for exporting all artboards from current page.
the scaling of each artboard is forced to 8x.
*/
var exportAllPages8x = function (context) {
  exportAllPages(8, 'generic');
}
/**
function for exporting all artboards from current page.
the scaling of each artboard is forced to 8x.
*/
var exportCurrentPage8x = function (context) {
  exportCurrentPage(8, 'generic');
}

/**
function for exporting all artboards from all pages except, Symbols, Styles and pages beginning with _
*/
var exportAllPages = function (scale, platform) {
  var doc = require('sketch/dom').getSelectedDocument();
  var title = getPageTitle();
  var pages = doc.pages;
  var exportPath = getExportPath(doc);
  var imgConfigList = []
  var pagenames = [];
  var imgID = {'idcount': 0};
  for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      if (page.name == "Symbols" || page.name.indexOf("_") == 0 || page.name == "Styles") {
  			log('skipping page: '+page.name);
  		}
      else{
        pagenames.push(page.name);
        var imgConfigListForPage = exportArtboardsOfPage(scale, page, exportPath, imgID);
        imgConfigList.push(imgConfigListForPage);
      }
  }
  createAndOpenHTML(imgConfigList, exportPath, title, imgID.idcount, platform);
};

/**
function for exporting all artboards from current page.
*/
var exportCurrentPage = function (scale, platform) {
  var doc = require('sketch/dom').getSelectedDocument();
  var title = getPageTitle();
  var exportPath = getExportPath(doc);
  var imgConfigList = [];
  var page = doc.selectedPage;
  var imgID = {'idcount': 0};
  var imgConfigListForPage = exportArtboardsOfPage(scale, page, exportPath, imgID);
  imgConfigList.push(imgConfigListForPage);
  createAndOpenHTML(imgConfigList, exportPath, title, imgID.idcount, platform);
};

/**
function for deleting old export folder and creating a new one
*/
var getExportPath = function (doc) {
  var docLocation = decodeURI(doc.path).split('/').slice(0,-1).join('/');
  var exportPath = docLocation + "/neogallery/";
  var imageExportPath = exportPath + "img/";
  FSUtil.deleteAndCreateFolder(exportPath);
  FSUtil.createFolder(imageExportPath);
  return exportPath;
}

/**
  function for exporting all artboards of a given page.
  returns a json object of the list of images
*/
var exportArtboardsOfPage = function (scale, page, exportPath, imgID) {
  var UI = require('sketch/ui')
  var sketch = require('sketch/dom')
  var imgConfigListForPage = [];
  var imageExportPath = exportPath + "img/";
  UI.message("Exporting page: "+ page.name);
  var artboards = page.layers.filter(l => l.type == 'Artboard');
  var imageID = imgID.idcount;
  for (var j = 0; j < artboards.length; j++) {
      var artboard = artboards[j];
      //check if artboard is marked for export, ignore others
      if (artboard.exportFormats.length > 0) {
          if (scale == undefined) {
            scale = artboard.exportFormats[0].size.replace('x','')
          }
          var fileFormat = artboard.exportFormats[0].fileFormat;
          if(artboard.frame.width > artboard.frame.height && artboard.name.indexOf("~L") == -1){
            artboard.name += "~L";
          }
          var filename = artboard.name + ".png";
          if (scale > 1) {
            filename = artboard.name +'@'+scale+"x."+artboard.exportFormats[0].fileFormat;
          }
          options = {formats: fileFormat, scales: scale, output: imageExportPath};
          sketch.export(artboard, options);
          if(artboard.name.indexOf("~2") !=-1){
            var imgU = filename.replace("~2", "~1");
            console.log(imgConfigListForPage);
            console.log(imgU);
            var mageID = imgConfigListForPage.filter(function(imgcon){return imgcon.imageURL == 'img/'+imgU})[0].imageID;
            imgconfig = {'imageID': ''+mageID, 'imageURL': 'img/'+filename}
          }
          else{
            imgconfig = {'imageID': ''+imageID, 'imageURL': 'img/'+filename}
            imageID+=1;
          }
          imgConfigListForPage.push(imgconfig);
      }
  }
  var imgConf = { 'pagename' : ''+page.name, 'imgList' : imgConfigListForPage};
  imgID.idcount = imageID;
  return imgConf;
}

/**
  function for creating the HTML using the img list, once created it will automatically open the file using default browser
*/
var createAndOpenHTML = function (imgConfigList, exportPath, title, imageCount, platform) {
  var config = {"Images" : imgConfigList, "imageCount": imageCount, "createdDate": currentDate(), "title": title}
  var htmlString = GridHTML.getHTML(JSON.stringify(config), platform);
  var someString = [NSString stringWithFormat:"%@", htmlString], filePath = exportPath+"index.html";
  [someString writeToFile:filePath atomically:true encoding:NSUTF8StringEncoding error:nil];
  var UI = require('sketch/ui')
  UI.message("Artboards are exported in 'neogallery' folder next to your sketch file.");
}

/**
  function to return current date in dd MMM, YYYY format
*/
var currentDate = function () {
  var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
  var d = new Date();
  var curr_date = d.getDate();
  var curr_month = d.getMonth();
  var curr_year = d.getFullYear();
  return curr_date + " " + m_names[curr_month] + ", " + curr_year;
}
/**
 * function to get the page title from the user input.
 */
var getPageTitle = function(){
  var settings = require('sketch/settings')
  var UI = require('sketch/ui');
  var savedTitle = settings.settingForKey("neodashpreview-pagetitle");
  var pageTitle = savedTitle ? savedTitle: "Neogallery";
  UI.getInputFromUser(
    "Enter the page title", 
    {
      initialValue: pageTitle
    },
    (error, value) => {
      if (error) {
        log("user input cancelled");
        throw error;
      }
      pageTitle = value;
      settings.setSettingForKey("neodashpreview-pagetitle", pageTitle); // Save to user preferences
  });
  return pageTitle;
}
