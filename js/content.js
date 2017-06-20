'use strict';
console.log('jquery加载了没',typeof jQuery);
console.log('Cookie方法存在吗',typeof window.Cookies);
(function () {
	var avatar_src = $('.header>.avatar .img').attr('src')
		,avatar_path = avatar_src.substring(avatar_src.lastIndexOf('?')+1)
		;

	function getParaFromPath(path){
		var r = /([^&=\?]+)=?([^&]*)/g
			,url=path
			;
		var a,b={};
		while(a=r.exec(url)){
			b[a[1]]=a[2];
		}
		return b;
	}

	function reportIdkey(e, t, a) {
		var n = "https://support.weixin.qq.com/cgi-bin/mmsupport-bin/reportforweb?rid=" + e + "&rkey=" + t + "&rvalue=" + (a || 1);
		(new Image).src = n
	};

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
		var date = new Date('Mon Jun 19 2017 20:59:12 GMT+0800 (中国标准时间)');
		var type = blob.type;
		var params = getParaFromPath(avatar_path);
		var toUserName = $('.title_name.ng-binding').data('username');
		var formData = new FormData();
		var file = new File([blob], filename, {type: type, lastModified: date.valueOf()});
		formData.append("id","WU_FILE_0");
		formData.append("name",file.name);
		formData.append("type",file.type);
		formData.append("lastModifiedDate",file.lastModifiedDate );
		formData.append("size",file.size);
		formData.append("mediatype","pic");
		formData.append('uploadmediarequest','{"UploadType":2,"BaseRequest":{"Uin":1049656480,"Sid":"'
		+Cookies.get('wxsid')
		+'","Skey":"'
		+params.skey
		+'","DeviceID":"'
		+getDeviceID()
		+'"},"ClientMediaId":'
		+Date.now()
		+',"TotalLen":'
		+file.size
		+',"StartPos":0,"DataLen":'
		+file.size
		+',"MediaType":4,"FromUserName":"'
		+params.username
		+'","ToUserName":'
		+toUserName
		+',"FileMd5":"a6305de74fc95008373e14a86b551b1b"}');
		
		formData.append('webwx_data_ticket',Cookies.get('webwx_data_ticket'));
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
	
	var src = "http://wx1.sinaimg.cn/mw690/72635b6agy1fglwan3zeqj20go0m845p.jpg";

	chrome.runtime.sendMessage({method: 'downloadImg', url: src},function(res){
		if(res.err){
			console.log(res.err);
		}else if(res.data){
			var blobUrl = res.data;
			reportIdkey(63637,72,62);
			reportIdkey(63637,76);
			requestBlob(blobUrl,function(blob){
				if(blob){
					console.log("获取到blob数据");
					var xhr = new XMLHttpRequest();
					xhr.open('options','https://file.wx.qq.com/cgi-bin/mmwebwx-bin/webwxuploadmedia?f=json');
					xhr.send();
					wx_uploadImage(blob);
				}
			});
		}
	});
})();

