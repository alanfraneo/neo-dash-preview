@import './fs-utils.js';
@import './grid-html.js';
// const fs = require('fs');

/**
function for exporting all artboards from all pages except, Symbols, Styles and pages beginning with _
the scaling of each artboard is forced to 8x.
*/
var exportAllPages8x = function (context) {
  exportAllPages(context, '8x');
}
/**
function for exporting all artboards from all pages except, Symbols, Styles and pages beginning with _
the scaling of each artboard is taken from each artboards topmost export configuration.
*/
var exportAllPagesDefault = function (context) {
  exportAllPages(context, 'default');
}
/**
function for exporting all artboards from all pages except, Symbols, Styles and pages beginning with _
*/
var exportAllPages = function (context, scale) {
  var sketch = context.api();
  var app = sketch.Application();
  var doc = context.document;
  var userDefaults = NSUserDefaults.alloc().initWithSuiteName("com.neogallery.sketch");
  var title = getPageTitle(context, userDefaults);
  var pages = doc.pages();
  var exportPath = getExportPath(doc);
  var imgConfigList = []
  var currentPage = doc.currentPage();
  var pagenames = [];
  var imgID = {'idcount': 0};
  for (var i = 0; i < pages.count(); i++) {
      var page = pages[i];
      if (page.name() == "Symbols" || page.name().indexOf("_") == 0 || page.name() == "Styles") {
  			log('skipping page: '+page.name());
  		}
      else{
        pagenames.push(page.name())
        doc.setCurrentPage(page);
        var imgConfigListForPage = exportArtboardsOfPage(sketch, doc, scale, page, exportPath, imgID);
        imgConfigList.push(imgConfigListForPage);
      }
  }
  
  createAndOpenHTML(imgConfigList, exportPath, context, title, imgID.idcount);
  doc.setCurrentPage(currentPage); // since we change current page for exporting for each page, we reset here to original current page.
};
/**
function for exporting all artboards from current page.
the scaling of each artboard is forced to 8x.
*/
var exportCurrentPage8x = function (context, scale) {
  exportCurrentPage(context, '8x');
}
/**
function for exporting all artboards from current page.
the scaling of each artboard is taken from each artboards topmost export configuration.
*/
var exportCurrentPageDefault = function (context, scale) {
  exportCurrentPage(context, 'default');
}
/**
function for exporting all artboards from current page.
*/
var exportCurrentPage = function (context, scale) {
  var sketch = context.api();
  var app = sketch.Application();
  var doc = context.document;
  var userDefaults = NSUserDefaults.alloc().initWithSuiteName("com.neogallery.sketch");
  var title = getPageTitle(context, userDefaults);
  var exportPath = getExportPath(doc);
  var imgConfigList = [];
  var page = doc.currentPage();
  var imgID = {'idcount': 0};
  var imgConfigListForPage = exportArtboardsOfPage(sketch, doc, scale, page, exportPath, imgID);
  imgConfigList.push(imgConfigListForPage);
  createAndOpenHTML(imgConfigList, exportPath, context, title, imgID.idcount);
};
/**
function for deleting old export folder and creating a new one
*/
var getExportPath = function (doc) {
  var docLocation = doc.fileURL().path().split(doc.displayName())[0];
  // log(docLocation);
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
var exportArtboardsOfPage = function (sketch, doc, scale, page, exportPath, imgID) {
  var imgConfigListForPage = [];
  var imageExportPath = exportPath + "img/";
  doc.showMessage("Exporting page: "+ page.name());
  var artboards = page.artboards();
  var imageID = imgID.idcount;
  for (var j = 0; j < artboards.count(); j++) {
      var artboard = artboards[j];
      //check if artboard is marked for export, ignore others
      if (artboard.exportOptions().exportFormats().length > 0) {
          var suffix = "";
          if(artboard.frame().width() > artboard.frame().height()){
            suffix = "~L"
          }
          var filename = artboard.name() + suffix +".png";
          var artboardscale = getArtboardScale(artboard, scale);
          doc.saveArtboardOrSlice_toFile_(scaleArtboard(artboard, artboardscale), imageExportPath + filename);
          if(artboard.name().indexOf("~2") !=-1){
            var imgU = filename.replace("~2", "~1");
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
  var imgConf = { 'pagename' : ''+page.name(), 'imgList' : imgConfigListForPage};
  imgID.idcount = imageID;
  return imgConf;
}

var getArtboardScale = function (artboard, scale) {
  if (scale == '8x') {
    return '8';
  }else if(scale == 'default'){
    //read from artboards top most export config
    return String(artboard.exportOptions().exportFormats()[0]).split('  ')[0];
  }else{
    return '1'; //will never happen
  }
}
/**
  function for creating the HTML using the img list, once created it will automatically open the file using default browser
*/
var createAndOpenHTML = function (imgConfigList, exportPath, context, title, imageCount) {
  var config = {"Images" : imgConfigList, "imageCount": imageCount, "createdDate": currentDate(), "title": title}
  var htmlString = GridHTML.getHTML(context, JSON.stringify(config));
  var someString = [NSString stringWithFormat:"%@", htmlString], filePath = exportPath+"index.html";
  [someString writeToFile:filePath atomically:true encoding:NSUTF8StringEncoding error:nil];
  var file = NSURL.fileURLWithPath(filePath);
  NSWorkspace.sharedWorkspace().openFile(file.path());
  context.document.showMessage("Artboards are exported in 'neogallery' folder next to your sketch file.");
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
  function to scale the artboard while exporting, current setting is at 2x.
*/
var scaleArtboard = function(layer, artboardscale) {
    var rect = layer.absoluteInfluenceRect()
    var request = [MSExportRequest new]
    request.rect = rect
    // request.scale = 2; //scaling at 2x
    request.scale = artboardscale;
    return request
 };

 var getSavedPagetitle = function(userDefaults){
  var pageTitle = userDefaults.objectForKey("pagetitle");
  if(pageTitle != undefined){
    return pageTitle
  } else {
    return "NeoGallery"; // Default value
  }
}

var getPageTitle = function(context, userDefaults){
  var UI = require('sketch/ui');
  var pageTitle = UI.getStringFromUser("Enter your page title", getSavedPagetitle(userDefaults));
  [userDefaults setObject:pageTitle forKey:"pagetitle"]; // Save to user defaults
  userDefaults.synchronize();
  return pageTitle;
}
