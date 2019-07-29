window.onload = function() {
    NeoGallery.initNeoGallery();
}

var NeoGallery = new function() {

    this.getfullImgList = function(){
        var fullImgList = [];
        for (i in imgconfig.Images){
          if (imgconfig.Images[i].hasOwnProperty("imgList")) {
            fullImgList = fullImgList.concat(imgconfig.Images[i].imgList)  
          }
        }
        return fullImgList;
    };

    this.fullImageList = this.getfullImgList();

    this.initNeoGallery = function() {
        NeoGallery.renderGallery(imgconfig);
        NeoGallery.handleHashChange();
        window.onhashchange = NeoGallery.handleHashChange;
    };

    this.changeTab = function(evt) {
        document.getElementsByClassName('active')[0].classList.remove('active');
        evt.classList.add('active');
        NeoGallery.renderGalleryforTab(imgconfig, evt.innerHTML);
    };


    this.renderTabs = function(json){
      var images = json.Images;
      var tabs = [];
      for (var i in images){
        if (images[i].hasOwnProperty('pagename')) {
          tabs.push(images[i].pagename);
        }
      }
      var tabHTML = ``;
      if(tabs.length > 0){
        for (var tab in tabs){
          if (tab == 0) {
            tabHTML += `<li onclick="NeoGallery.changeTab(this)" class='active'>${tabs[tab]}</li>`
          }else{
            tabHTML += `<li onclick="NeoGallery.changeTab(this)">${tabs[tab]}</li>`
          }
        }
      }
      document.getElementById('tabs').innerHTML = tabHTML;
    };

    this.renderGallery = function(json) {
        NeoGallery.renderTabs(json);
        var images = json.Images;
        var title = json.title;
        if (title == undefined) {
            title = document.location.pathname.substring(1);
            title = decodeURI(title);
        }
        document.title = title;
        document.getElementById("title").innerHTML = `<a id="backbtn" href="../">&lt; Back</a>
        <div class='createdon title'>${title}</div>
        <div class='createdon'>uploaded on: ${json.createdDate}</div>
        <div class='createdon'>Click on an image to see full screen</div>`;
        document.body.innerHTML += `<div id="prevBtn" class="control previous hidden" onclick='NeoGallery.controls(this)'>${NeoGallery.getNextIcon(180)}</div>
                                    <div id="nextBtn" class="control next hidden" onclick='NeoGallery.controls(this)'>${NeoGallery.getNextIcon(0)}</div>`;
        document.body.style.backgroundColor = '#fff';
        NeoGallery.renderGalleryforTab(json, images[0].pagename);
        document.addEventListener('keydown', NeoGallery.bindKeyboardShortcuts);
    };


    this.renderGalleryforTab = function (json, tabname) {
        document.getElementById("neogallery").innerHTML = "";
        var images = json.Images;
        for (var i in images){
            if(images[i].hasOwnProperty('pagename') && images[i].pagename == tabname){
                for (var j in images[i].imgList){
                  var imgURL = images[i].imgList[j].imageURL;
                  if(imgURL.indexOf('~1') != -1){
                    document.getElementById("neogallery").innerHTML += NeoGallery.getFramedPairHTML(images[i].imgList[j].imageID, true);
                  }
                } 
            }
        }      
    }

    this.getNextIcon = function(rotation){
        return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 32 32" height="32px" id="Layer_1" version="1.1" viewBox="0 0 32 32" width="32px" xml:space="preserve" transform="rotate(${rotation}) scale(3 3)">
                    <path d="M24.291,14.276L14.705,4.69c-0.878-0.878-2.317-0.878-3.195,0l-0.8,0.8c-0.878,0.877-0.878,2.316,0,3.194  L18.024,16l-7.315,7.315c-0.878,0.878-0.878,2.317,0,3.194l0.8,0.8c0.878,0.879,2.317,0.879,3.195,0l9.586-9.587  c0.472-0.471,0.682-1.103,0.647-1.723C24.973,15.38,24.763,14.748,24.291,14.276z" fill="#515151"/>
                </svg>`;
    };
    
    this.controls = function(el) {
        var nextImgNumber = parseInt(document.getElementById("maxedImage").attributes['current-img'].value);
        if (el.attributes['id'].value == 'prevBtn') {
            nextImgNumber -= 1;
        } else if (el.attributes['id'].value == 'nextBtn') {
            nextImgNumber += 1;
        }
        NeoGallery.setMaxImage(nextImgNumber);
    };

    this.bindKeyboardShortcuts = function (e) {
        if (document.getElementById('maxedImage')) {
            switch (e.keyCode) {
                case 37: // left
                    document.getElementById("prevBtn").click();
                    break;

                case 39: // right
                    document.getElementById("nextBtn").click();
                    break;

                case 27: // esc
                    NeoGallery.closeLargeImage();
                    break;

                default:
                    return; // exit this handler for other keys
            }
        }
        e.stopPropagation(); // prevent the default action (scroll / move caret)
    };

    this.handleHashChange = function() {
        if (window.location.hash != '#' && window.location.hash != '') {
            imgNumber = window.location.hash.split("#")[1];
            imgToClick = parseInt(imgNumber) - 1;
            NeoGallery.setMaxImage(imgToClick);
        }
        else{ //no hash in UI, so close the maxed image if it exists
            NeoGallery.closeLargeImage();
        }
    };

    this.getImgURL = function(imgId){
      return NeoGallery.fullImageList.filter(function(image){return image.imageID == imgId})[0].imageURL;
    };

    this.setMaxImage = function(nextImgNumber) {
        if(nextImgNumber >=0 && nextImgNumber < parseInt(imgconfig.imageCount)){
            NeoGallery.hideGallery(nextImgNumber);
            document.body.innerHTML += `<div id='maxedImage' current-img='${nextImgNumber}'>
                                          <img src='${NeoGallery.getImgURL(nextImgNumber)}'>
                                        </div>`;
            document.getElementById("maxedImage").innerHTML = '';
            document.getElementById("maxedImage").setAttribute('current-img', nextImgNumber);
            document.getElementById("maxedImage").innerHTML += NeoGallery.getFramedPairHTML(nextImgNumber, false);
            document.getElementById("maxedImage").addEventListener('click', NeoGallery.closeLargeImage);
            window.scrollTo(0, 0);
            window.location.hash = '#' + (nextImgNumber + 1);
        }
    };

    this.getFramedPairHTML = function(imageID, expandable){
      var imgURL = NeoGallery.getImgURL(imageID);
      var notchsrc = '/bi/webapp/images/vertical-notch.png';
      var orientation = 'potrait';
      if (imgURL.indexOf('~L') !=-1) {
          notchsrc = '/bi/webapp/images/horizontal-notch.png'
          orientation = 'landscape';
      }
      if(imgURL.indexOf('~1') != -1){
          var pairImageURL = imgURL.replace('~1', '~2');
          var itemTitle = (parseInt(imageID)+1)+" - "+imgURL.split("/")[1].split(".")[0].replace("~1","").replace("~L", "");
          var expand = 'onclick="NeoGallery.maximizeImage(this)';
          return `<div id=${imageID} class='pairHolder ${orientation}' ${expandable?expand:""}">
                         <div class='itemtitle'>${itemTitle}</div>
                         <div class='itembdy'>
                            <div class='imageHolder'>
                              <img src='${notchsrc}' class='notch' >
                              <div class="img-container">
                                <img src='${imgURL}' class='image' >
                              </div>
                            </div>
                            <div class='imageHolder'>
                              <img src='${notchsrc}' class='notch' >
                              <div class="img-container">
                                <img src='${pairImageURL}' class='image' >
                              </div>
                            </div>
                        </div>
                        </div> `
      }else{
        return ''
      }
    };

    this.hideGallery = function(imgNumber){
        document.getElementsByClassName("control").show();
        if (imgNumber ==0) document.getElementById("prevBtn").hide();
        if (imgNumber == parseInt(imgconfig.imageCount)-1) document.getElementById("nextBtn").hide();
        if(document.getElementById("maxedImage")) document.getElementById("maxedImage").remove();
        document.getElementById("neogallery").hide();
        document.getElementById("tabs").hide();
        document.getElementById("title").hide();      
    }

    this.maximizeImage = function(el) {
        var currentImg = parseInt(el.attributes['id'].value);
        NeoGallery.hideGallery(currentImg);
        document.body.innerHTML += `<div id='maxedImage' current-img='${currentImg}'>
                                      <img src='${NeoGallery.getImgURL(currentImg)}'>
                                      <img src='${NeoGallery.getImgURL(currentImg).replace("~1", "~2")}'>
                                    </div>`;
        window.location.hash = '#' + (currentImg + 1);
        document.getElementById("maxedImage").addEventListener('click', NeoGallery.closeLargeImage);
        window.scrollTo(0, 0);
    };

    this.removeHash = function () {
        history.replaceState("", document.title, window.location.pathname + window.location.search);
    };

    this.closeLargeImage = function () {
        if(document.getElementById("maxedImage")) document.getElementById("maxedImage").remove();
        document.getElementById("neogallery").show();
        document.getElementById("title").show();
        document.getElementsByClassName("control").hide();
        NeoGallery.removeHash();
    };
}

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}
Element.prototype.hide = function() {
    this.classList.add('hidden');
}
Element.prototype.show = function() {
    this.classList.remove('hidden');
}
NodeList.prototype.hide = HTMLCollection.prototype.hide = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        this[i].classList.add('hidden');
    }
}
NodeList.prototype.show = HTMLCollection.prototype.show = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        this[i].classList.remove('hidden');
    }
}