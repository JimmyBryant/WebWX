'use strict';
console.log('jquery加载了没',typeof jQuery);
console.log('jquery加载了没',typeof $);
(function () {

	function getDeviceID() {
		return "e" + ("" + Math.random().toFixed(15)).substring(2, 17)
	}

	function requestBlob(url,callback){
		var xhr = new XMLHttpRequest();
		xhr.open('get',url,true);
		xhr.responseType = "blob";
		xhr.onload = function(){
		  if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
		    var blob = xhr.response;
		    callback(blob);
		  }else{
		  	callback(null);
		  }
		};
		xhr.send();
	}

	//上传微信图片
	function wx_uploadImage(blob){
		var url = 'https://file.wx.qq.com/cgi-bin/mmwebwx-bin/webwxuploadmedia?f=json';
		var filename = "72635b6agy1fglwan3zeqj20go0m845p.jpg";
		var size = blob.size
			,type = blob.type
			;
		var formData = new FormData();
		var file = new File([blob], filename, {type: type, lastModified: Date.now()});
		formData.append("id","WU_FILE_0");
		formData.append("name",filename);
		formData.append("type",type);
		formData.append("lastModifiedDate",new Date().toString());
		formData.append("size",size);
		formData.append("mediatype","pic");
		formData.append('uploadmediarequest','{"UploadType":2,"BaseRequest":{"Uin":1049656480,"Sid":"i1JmEPSJq/+oYI/A","Skey":"@crypt_a704984_c3cae9762f97222924781e590bd69b14","DeviceID":'+getDeviceID()+'},"ClientMediaId":'+Date.now()+',"TotalLen":'+size+',"StartPos":0,"DataLen":'+size+',"MediaType":4,"FromUserName":"@438224a747b02f90b075c24d1a375bf294a9c7373a5e3d645fd5aed4e446ed1d","ToUserName":"@719237ca9093427212f1add4c91fdd648859506ac0924bf8b068ab8dadf35aee","FileMd5":"630fb39b576c03daaa6f63a161dc403c"}');
		
		formData.append('webwx_data_ticket','gSesW4T4QnVynCv1RLOgvIy0');
		formData.append('pass_ticket',"undefined");
		formData.append("filename",file);
		var xhr = new XMLHttpRequest();
		xhr.open('post',url);
		xhr.onload = function(){
			if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
				console.log('图片提交');
				console.log(xhr.resonseText);
			}
		}
		xhr.send(formData);
	}	
	console.log("content.js开始执行");
	var src = "http://wx1.sinaimg.cn/mw690/72635b6agy1fglwan3zeqj20go0m845p.jpg";

	chrome.runtime.sendMessage({method: 'downloadImg', url: src},function(res){
		if(res.err){
			console.log(res.err);
		}else if(res.data){
			var blobUrl = res.data;
			requestBlob(blobUrl,function(blob){
				if(blob){
					var xhr = new XMLHttpRequest();
					xhr.open('options','https://file.wx.qq.com/cgi-bin/mmwebwx-bin/webwxuploadmedia?f=json');
					xhr.send();
					wx_uploadImage(blob);
				}
			});
		}
	});
})();

