chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var res;
    switch (request.method) {
        case 'downloadImg':
        	var xhr = new XMLHttpRequest();
        	xhr.open('get',request.url,true);
        	xhr.responseType = "blob";
        	xhr.onload = function(){
			  if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
			    	var blob = xhr.response;
			    	res = {
			    		err:null,
			    		data:window.URL.createObjectURL(blob) 
			    	};
    				sendResponse(res);
			  }else{
			  		res = {
			  			err:"加载图片出错"
			  		};
					sendResponse(res);
			  }
        	};
        	xhr.send();
        return true;
    }
});

/*chrome.browserAction.onClicked.addListener(function(tab){
     chrome.tabs.executeScript(tab.id, {file: 'js/jquery.min.js'});  
	 chrome.tabs.executeScript(tab.id,{file:'js/cookie.js'});
     chrome.tabs.executeScript(tab.id, {file: 'js/content.js'});  
});*/