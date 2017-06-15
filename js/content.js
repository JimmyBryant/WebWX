'use strict';
(function (w) {
	console.log("插件开始执行");
	var src = "http://wx3.sinaimg.cn/mw690/7693f09aly1fglycgiql9j20c508k0td.jpg";
	chrome.runtime.sendMessage({method: 'downloadImg', url: src},function(blob){
		var img = document.createElement("img");
		img.onload = function(e) {
			window.URL.revokeObjectURL(img.src); // 清除释放
		};
		console.log(typeof window.URL);
		console.log(blob);
/*		img.src = window.URL.createObjectURL(blob);
		document.body.appendChild(img);*/
	});
})(window);

