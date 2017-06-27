'use strict';

(function(){
    console.log('jquery加载了没',typeof jQuery);
    console.log('Cookie方法存在吗',typeof window.Cookies);

    window['WEBWX_EXTENSION_CONF'] = {
        API_webwxsendmsgimg:"https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsgimg?fun=async&f=json",
        API_batchgetcontact:"https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxbatchgetcontact",
        API_webwxgetcontact:"https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact",
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
    var now = Date.now();
    var wxsid = Cookies.get('wxsid');
    var MEMBERLIST = null;  //存放所有联系人
    var GROUPLIST = [];   //存放微信群
    // 判断是否登陆
    if(wxsid){
        var avatar_src = $('.header>.avatar .img').attr('src')
            ,avatar_path = avatar_src.substring(avatar_src.lastIndexOf('?')+1)
            ,params = getParaFromPath(avatar_path)
            ;
        
        var util = {
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
            getBaseRequest:function () {
                var _ = this;
                return {
                    Uin: Cookies.get('wxuin'),
                    Sid: Cookies.get('wxsid'),
                    Skey: params.skey,
                    DeviceID: _.getDeviceID()
                }
            }
        }

        /*
        * 获取所有微信好友
        * @return {Promise} 返回relove promise
        */
        function webwx_getContact(){
            let query = ["seq=0","r="+now,"lang=zh_CN","skey="+params.skey,"bitterg"];
            let url = WEBWX_EXTENSION_CONF.API_webwxgetcontact+"?"+query.join('&');
            return util.request('get',url).then(res=>{
                let data = JSON.parse(res);
                if(data.MemberList.length){
                    MEMBERLIST = data.MemberList;
                    var list = [];
                    MEMBERLIST.forEach(function(element) {
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
                    let url = WEBWX_EXTENSION_CONF.API_batchgetcontact+"?"+query.join("&");
                    let baseRequest = util.getBaseRequest();
                    var data = {
                        BaseRequest:baseRequest,
                        Count:count,
                        List:groupList
                    };
                    return util.request('post',url,JSON.stringify(data)).then(res=>{
                        return res;
                    })
                    
                }else{
                    throw "list不能长度不能为0";
                }
            });

        }


        var start = function(){
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
        }

        start(); 
        
    }
})();


