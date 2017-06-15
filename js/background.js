
console.log('这是背景页面')
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.type) {
        case 'downloadImg':
        	console.log(sender);
        	console.log('接收到请求');
        	var xhr = new XMLHttpRequest();
        	xhr.open('get',request.src);
        	xhr.onreadystatechange (function(){
			  if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
			    	var blob = xhr.response;
    				sendResponse("你好");
    				console.log("会执行吗",blob)
			  }
        	});
        	xhr.send();
        break;
    }
});