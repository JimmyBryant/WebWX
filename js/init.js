'use strict';

(function(){
    var now = Date.now();
    var wxsid = Cookies.get('wxsid');
    // 判断是否登陆
    if(wxsid){
        var avatar_src = $('.header>.avatar .img').attr('src')
            ,avatar_path = avatar_src.substring(avatar_src.lastIndexOf('?')+1)
            ,params = utils.getParaFromPath(avatar_path)
            ,skey = params.skey
            ;
        chrome.runtime.sendMessage({
            type:MESSAGE_TYPE.START,
            baseRequest:utils.getBaseRequest(skey)
        })
        
    }
})();



