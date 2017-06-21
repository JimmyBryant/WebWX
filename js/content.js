'use strict';
console.log('jquery加载了没',typeof jQuery);
console.log('Cookie方法存在吗',typeof window.Cookies);
(function () {
	var CONF = {
		API_webwxsendmsgimg:"https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsgimg?fun=async&f=json",
		MSGTYPE_IMAGE:3
	};

	//获取地址栏参数
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

	var avatar_src = $('.header>.avatar .img').attr('src')
		,avatar_path = avatar_src.substring(avatar_src.lastIndexOf('?')+1)
		,params = getParaFromPath(avatar_path)
		;

	function reportIdkey(e, t, a) {
		var n = "https://support.weixin.qq.com/cgi-bin/mmsupport-bin/reportforweb?rid=" + e + "&rkey=" + t + "&rvalue=" + (a || 1);
		(new Image).src = n
	};

	function getDeviceID() {
		return "e" + ("" + Math.random().toFixed(15)).substring(2, 17)
	}

	function getClientMsgId () {
  		return (Date.now() + Math.random().toFixed(3)).replace('.', '')
	}

	function  getBaseRequest () {
		return {
			Uin: Cookies.get('wxuin'),
			Sid: Cookies.get('wxsid'),
			Skey: params.skey,
			DeviceID: getDeviceID()
		}
	}

	function request(method,url,data){
		data = data||null;
		return new Promise(function(resolve,reject){
			var xhr = new XMLHttpRequest();
			xhr.open(method,url);
			xhr.onload = function(){
				if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
					var res = xhr.response;
					resolve(res);
				}else{
					reject('获取blob失败');
				}
			};
			xhr.send(data);
		});
	}

	// 获取图片blob数据
	function requestBlob(url){
		return new Promise(function(resolve,reject){
			var xhr = new XMLHttpRequest();
			xhr.open('get',url,true);
			xhr.responseType = "blob";
			xhr.onload = function(){
				if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
					console.log("获取到blob数据");
					var blob = xhr.response;
					resolve(blob);
				}else{
					reject('获取blob失败');
				}
			};
			xhr.send();
		})
	}

	//上传微信图片
	function wx_uploadImage(blob){
		return Promise.resolve().then(()=>{
			var url = 'https://file.wx.qq.com/cgi-bin/mmwebwx-bin/webwxuploadmedia?f=json';
			var name = "72635b6agy1fglwan3zeqj20go0m845p.jpg";
			var date = new Date();
			var type = blob.type
				,size = blob.size
				;

			var toUserName = $('.title_name.ng-binding').data('username');
			var formData = new FormData();
			var file = new File([blob], name, {type: type, lastModified: date.valueOf()});
			var baseRequest = getBaseRequest();
			formData.append("id","WU_FILE_0");
			formData.append("name",name);
			formData.append("type",type);
			formData.append("lastModifiedDate",file.lastModifiedDate );
			formData.append("size",size);
			formData.append("mediatype","pic");
			formData.append('uploadmediarequest',JSON.stringify({
				"UploadType":2,
				"BaseRequest":baseRequest,
				"ClientMediaId":getClientMsgId(),
				"TotalLen":size,
				"StartPos":0,
				"DataLen":size,
				"MediaType":4,
				"FromUserName":params.username,
				"ToUserName":toUserName
			}
			));
			
			formData.append('webwx_data_ticket',Cookies.get('webwx_data_ticket'));
			formData.append('pass_ticket',"undefined");
			formData.append("filename",file);
			
			return request('post',url,formData).then(res=>{
				return JSON.parse(res);
			})
		});

	}	

	//发送图片消息
	function sendPic (mediaId, to) {
		return Promise.resolve().then(() => {
			let clientMsgId = getClientMsgId();
			var baseRequest = getBaseRequest();
			let data = {
				'BaseRequest': baseRequest,
				'Scene': 0,
				'Msg': {
				'Type': CONF.MSGTYPE_IMAGE,
				'MediaId': mediaId,
				'FromUserName': params.username,
				'ToUserName': to,
				'LocalID': clientMsgId,
				'ClientMsgId': clientMsgId
				}
			}
			return request('post',CONF.API_webwxsendmsgimg,JSON.stringify(data)).then(res=>{
				console.log(res);
				return res;
			});
		});
	};


	var src = "http://n.sinaimg.cn/sports/2_img/upload/4bc9295c/20170620/-8g8-fyhfxph4972089.jpg";

	chrome.runtime.sendMessage({method: 'downloadImg', url: src},function(res){
		if(res.err){
			console.log(res.err);
		}else if(res.data){
			var blobUrl = res.data;

			requestBlob(blobUrl).then(blob=>{
				console.log(typeof blob);
				if(blob instanceof Blob){
					console.log("获取到blob数据");
					return wx_uploadImage(blob);
				}else{
					throw "没有获取到blob"
				}
			}).then(responseData=>{
				console.log("什么数据",responseData);
				let mediaId = responseData.MediaId;
				let toUserName = $('.title_name.ng-binding').data('username');
				sendPic(mediaId,toUserName);
			});

		}
	});
})();

