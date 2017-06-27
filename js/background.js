'use strict';

var baseRequest = null;
var now = Date.now();

var GROUPLIST = [];   //存放微信群

function setBaseRequest(data){
	baseRequest = data;
}
function getBaseRequest(){
	return baseRequest;
}

/*
* 获取所有微信好友
* @return {Promise} 返回relove promise
*/
function webwx_getContact(){
	let query = ["seq=0","r="+now,"lang=zh_CN","skey="+baseRequest.skey,"bitterg"];
	let url = GLOBAL_CONFIG.API_webwxgetcontact+"?"+query.join('&');
	return utils.request('get',url).then(res=>{
		let data = JSON.parse(res);
		if(data.MemberList.length){
			var memberList = data.MemberList;
			var list = [];
			memberList.forEach(function(element) {
				if(element.UserName.indexOf('@@')!=-1){
					list.push(element);
				}
			});
			return list;
		}else{
			throw "获取微信好友失败";
		}

	});
}

/*
* 批量获取群用户信息
* @param {Array} list [{EncryChatRoomId:'',UserName:''}]
* @return {Promise} 返回relove promise
*/
function webwx_batchGetContact(list){
	return Promise.resolve().then(()=>{
		if(list.length){
			let groupList = [];
			list.forEach(function(element){
				groupList.push({EncryChatRoomId:element.EncryChatRoomId,UserName:element.UserName});
			});
			let count = list.length;
			let query = ["type=ex","r="+now,"lang=zh_CN"]
			let url = GLOBAL_CONFIG.API_batchgetcontact+"?"+query.join("&");
			let baseRequest = getBaseRequest();
			var data = {
				BaseRequest:baseRequest,
				Count:count,
				List:groupList
			};
			return utils.request('post',url,JSON.stringify(data)).then(res=>{
				return res;
			})
			
		}else{
			throw "list不能长度不能为0";
		}
	});

}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var res;
    switch (request.type) {
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
		case MESSAGE_TYPE.START:
			console.log("执行start事件")
			setBaseRequest(request.baseRequest);
            webwx_getContact().then(list=>{
                console.log('这是群list',list);
                return webwx_batchGetContact(list);
            }).then(res=>{
                var data = JSON.parse(res);
                GROUPLIST = data.ContactList;
                console.log('群数据',GROUPLIST);
                // 将微信群数据保存到本地
                // window.localStorage.groupList = JSON.stringify(data.ContactList);
                return GROUPLIST;
            });
		return true;
    }
});

/*chrome.browserAction.onClicked.addListener(function(tab){
     chrome.tabs.executeScript(tab.id, {file: 'js/jquery.min.js'});  
     chrome.tabs.executeScript(tab.id, {file: 'js/cookie.js'});  	
     chrome.tabs.executeScript(tab.id, {file: 'js/content.js'});  
});*/