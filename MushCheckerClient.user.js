// ==UserScript==
// @name         Mush Checker Client
// @namespace    MushCheckerServer
// @version      0.1.2
// @description  Sends auth info to Mush Checker Server
// @author       Amadare
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @match        http://mush.twinoid.com/
// @updateURL    *
// @grant        GM_xmlhttpRequest
// ==/UserScript==
/* jshint -W097 */

(function() {
var sending = false;


function getIsLoggedIn(){
    return $('.notsure').length > 0;
}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setSendInProgress(){
    sending = true;
    $('.a-send-txt').text('Sending...');
}

function setSendStandBy(){
    sending = false;
    $('.a-send-txt').text('Send Auth data');
}

function changeUrl(){
    var url = window.prompt("Please, enter Mush Checker Server url", localStorage.AutoCheckerUrl);
    if (!url)
        return;
    if (!url.endsWith('/')){
        url += '/';
    }
    localStorage.AutoCheckerUrl = url;
}

function addSendAuthButton(){
    $(".clickme .but").after('<div class="but but2 a-send"><div class="butright but2right"><div class="butbg but2bg"><div class="a-send-txt">Send Auth data</div></div></div></div>');
    $('.a-send').on('click', getAndSend);
}

function addChangeServerUrlElement(){
    var element = '<div class="notsure a-change-url" onmouseover="this.style.textDecoration=\'underline\';" onmouseout="this.style.textDecoration=\'none\';" style="text-decoration: none; cursor: pointer;">Change Mush Checker Server url</div>';
    $('.notsure').before(element);
    $('.a-change-url').on('click', changeUrl);
}

function getSendUrl(command){
    if (!localStorage.AutoCheckerUrl){
        changeUrl();
    }
    if (!localStorage.AutoCheckerUrl)
        return null;
    return localStorage.AutoCheckerUrl + command;
}

function getTextFromResponse(responseDetails){
    if (!!window.InstallTrigger){
        //Damn! It's firefox!
        return responseDetails.responseXML.activeElement.childNodes[0].data;
    }
    return responseDetails.responseText;
}

function sendInfo(info){
    if (sending)
        return;
    var url = getSendUrl("RegisterUser");
    if (!url)
        return;
    setSendInProgress();
    console.log(JSON.stringify(info));
    GM_xmlhttpRequest({
        method: 'POST', url: url, data: JSON.stringify(info), headers: {'Content-type': 'application/json'},
        onload: function(responseDetails) {
            setSendStandBy();
            alert("Auth info is " + getTextFromResponse(responseDetails));
        },
        ontimeout: function(){
            setSendStandBy();
            alert('Request timeout');
        },
        onerror: function(){
            setSendStandBy();
            alert('Error ocurred!');
        }
    });
}

function getAndSend(){
    var info = {
        mush_sid: getCookie("mush_sid"),
        saved_tid_sess: sessionStorage.saved_tid_sess,
        tid_contact: sessionStorage.saved_tid_sess,
        name: $('.tid_sideHeader span').text()
    };
    sendInfo(info);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////

if (getIsLoggedIn()){
    addSendAuthButton();
    addChangeServerUrlElement();
}
})();