'use strict';
window['utils'] = { 
	 getParaFromPath:function(path){//解析地址栏参数
		var r = /([^&=\?]+)=?([^&]*)/g
			,url=path
			;
		var a,b={};
		while(a=r.exec(url)){
			b[a[1]]=a[2];
		}
		return b;
	},
    getDeviceID:function() {
        return "e" + ("" + Math.random().toFixed(15)).substring(2, 17)
    },
    getClientMsgId:function() {
        return (Date.now() + Math.random().toFixed(3)).replace('.', '')
    },
    request:function(method,url,data){
        var d = data||null;
        return new Promise(function(resolve,reject){
            var xhr = new XMLHttpRequest();
            xhr.open(method,url);
            xhr.onload = function(){
                if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    var res = xhr.response;
                    resolve(res);
                }else{
                    reject('XMLHttpRequest请求发送失败');
                }
            };
            xhr.send(d);
        });
    },
    getBaseRequest:function (skey) {
        var _ = this;
        return {
            Uin: Cookies.get('wxuin'),
            Sid: Cookies.get('wxsid'),
            Skey: skey,
            DeviceID: _.getDeviceID()
        }
    }
}