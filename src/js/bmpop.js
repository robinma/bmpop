/**
 * Author by robinma
 *
 */

(function(root, factory) {
  //set up formFilter appropriately for the enviroment.
  if (typeof define === 'function' && (define.cmd || define.amd)) {
    define(function() {
      return factory(root);
    });
  } else {
    //as a browser global
    root.bm = factory(root);
  }

})(this, function(root) {

	var exports = {};
	//native promote
	var isIe6=(!!window.ActiveXObject&&!window.XMLHttpRequest),
	zindex=10100,
	maskColl=[], popColl=[],winAttr={},
	$body,$win,$dcmen;
	var init=function(parm){
		var def={
			callBack : null, //返回函数
			noTitle : false, //是否显示标题栏
			timeout : 0, //设置等待关闭时间，为0为不关闭
			arrow:false,
			direction:'top',//top|right|bottom|left
			skewing:'20',
			link : null, //链接地址
			requestType : null, //iframe,ajax,img
			title : '标题', //标题
			drag : true, //是否拖动，当此值为true时，如果noTitle为false，也不可以拖动
			width : 300, //内容区的宽度
			height : 'auto', //内容的高度
			html : '',//popBox的内容
			style:"",//目前针对iframe设置
			scrolling:"auto",//目前针对iframe使用
			nostyle:false,//remove popbox border style
 			noMask:false,
 			maskOpac:20,//set mask opacity value
 			noClose:false,
 			noscroll:false,
 			positionStyle:'auto',//auto|define
 			top:null,left:null,right:null,bottom:null,
 			closeFn:null,
 			type:'',    //判断是否为引导页类型
 			target:''   //引导页方式下选择点亮的目标元素
		};
		$.extend(def,parm);
		$body||($body=$('body'));
		$dcmen||($dcmen=$(document));
		if(!$win){
			$win=$(window);
			baseInfo();
		};
		return def;
	},
	getPopTpl=function(ntitle,title,arrow,nclose,nsty){
		var popTpl='<div class="bm_popwarp"><div class="bm_pop">'+(ntitle?'':'<div class="bm_pop_title">'+(nclose?'':'<a href="javascript:;" class="close" nt-type="bm_close"><span class="i"><em class="it">×</em></span></a>')+'<span class="t">'+title+'</span></div>')+'<div class="bm_contenter" note-type="pop-cont-warp"></div></div></div>';
		return popTpl;
	},
	getConfirmTpl=function(txt,ok,cc){
		var ctpl = '<div class="txt"><p>'+txt+'</p></div><div class="bm_pbtn_ar"><a href="javascript:;" class="bm_p_button bm_p_button_waiter" node-type="ok"><span class="tt">'+ok+'</span></a><a href="javascript:;" class="bm_p_button bm_p_button_green" node-type="cancel"><span class="tt">'+cc+'</span></a></div>';
		return ctpl;
	},
	getalertTpl=function(txt,ok){
		var ctpl='<div class="txt"><p>'+txt+'</p></div><div class="bm_pbtn_ar"><a href="javascript:;" class="bm_p_button bm_p_button_green" node-type="ok"><span class="tt">'+ok+'</span></a></div>';
		return ctpl;
	},
	getToastTpl=function(txt){
		var tpl='<div class="NY-con-warp" note-type="pop-cont-warp"><div class="NY-con-toast">	<p>'+txt+'</p></div></div>';
			return tpl;
	},
	 baseInfo=function(){
		var getWinInfo=function(){
			winAttr['winWidth']=$win.width();
			winAttr['winHeight']=$win.height();
		};
		$win.bind('resize.hmpop',function(){
			getWinInfo();
		});
		getWinInfo();
	};
	//-----------------------
	var mask=function(type,target){
		this.random=(Math.random()*10000*8|0).toString(16);
		this.init(type,target);
	};
	mask.prototype={
		init:function(type,target){
			var __=this;
			__.create();
		},
		create:function(){
			var __=this,html='<div class="NY-pop-mask"></div>';
			var mobj=$(html);
			__.setattr(mobj);
			$body.append(mobj);
			__.mobj=mobj;
			__.autoUpdata(mobj);
		},
		setattr:function(mobj){
			if(isIe6){
				var $h = $(document).height(), $wh =document.body.scrollHeight;
				$h = Math.max($h, $wh);
				mobj.css({'position':'absolute',height:$h});
			}else{
				mobj.css({'position':'fixed',height:winAttr['winHeight']});
			}
		},
		autoUpdata:function(mobj){
			var __=this;
			$win.bind('resize',function(){
				if(isIe6){
					var $h = $(document).height(), $wh =document.body.scrollHeight;
					$h = Math.max($h, $wh);
					mobj.css({'position':'absolute',height:$h});
				}else{
					mobj.css({height:winAttr['winHeight']});
				}
			});
		},
		setZindex:function(num){
			var __=this;
			__.mobj.css({'z-index':num});
		},
		close:function(){
			this.mobj.remove();
		},
		setOpac:function(val){
			this.mobj.css({'opacity':val/100,'filter':'alpha(opacity='+val+')'});
		}
	};
	var popFn=function(parm){
		for(var i in parm){
			this[i]=parm[i];
		}
		this.random=(Math.random()*10000000*8|0).toString(16);
		this.init();
	};
	popFn.prototype={
		init:function(){
			var __=this;
			__.createpop();
			__.createMask(__.type,__.target);
			//callback function
			if(typeof __.callBack==='function')__.callBack(__);
			__.autoClose(__.timeout);
		},
		createpop:function(){
			var __=this;
			var html=getPopTpl(__.noTitle,__.title,__.arrow,__.noClose,__.nostyle);
			var pobj=$(html);
			$body.append(pobj);
			__.setZindex(pobj);
			__.setPostion(pobj);
			//set pop DOM object with this object
			__.index=popColl.length;
			__.popobj=pobj;
			//let the object push in popColl
			popColl.push(__);
			//bind close icon eventy
			pobj.find('a[nt-type="bm_close"]').bind('click',function(){__.close();});
			__.afterSet();
		},
		afterSet:function(){
			var __=this,cont=__.popobj.find('div[note-type="pop-cont-warp"]');
			if(__.requestType && $.inArray(__.requestType, ['iframe', 'ajax', 'img']) != -1) {
				cont.html('<div class="NY-con_loading"></div>');
				//img
				if(__.requestType === 'img') {
					var img = $('<img />');
					img.attr("src", __.link);
					img.load(function() {
						img.appendTo(cont.empty());
						var imgobj = cont.find('img');
						__.width = imgobj.width();
						__.height = imgobj.height();
						__.setPostion(__.popobj);
					});
				}
				//ajax
				else if(__.requestType==='ajax'){
					$.get(__.link,function(date) {
						cont.html(date);
						__.setPostion(__.popobj);
					});
				}else{
					var ifr = $('<iframe frameborder="0" id="hmiframe" scrolling='+__.scrolling+' src=""></iframe>').attr("style",'height:'+(__.height=='auto'?__.height:__.height+'px')+ ';width:' + __.width + 'px;'+__.style);
					ifr.appendTo(cont.empty());
					setTimeout(function(){ifr.attr('src',__.link);},0);
				}
			}else if(__.link){
				$(__.link).clone(true).show().appendTo(cont.empty());
			}else if(__.html){
				cont.html(__.html);
			}
		},
		autoClose:function(time){
			var __=this;
			if(time>0){
				setTimeout(function(){
					__.close();
				},time);
			}
		},
		createMask:function(type,target){
			var __=this;
			if(!__.noMask){
				if(maskColl.length===0){
					var maskobj=new mask(type,target);
					maskColl.push(maskobj);
				}
				var pcount=popColl.length-1;
				var zidx=zindex+(pcount*10)+1;
				maskColl[0].setZindex(zidx);
				maskColl[0].setOpac(__.maskOpac);
			}
		},
		close:function(){
			var __=this;
			__.popobj.remove();
			//__.popobj=null;
			for(var i=popColl.length;i>=0;i--){
				if(popColl[i-1]['random']==__.random){
					popColl.splice(i-1,1);
					break;
				}
			};
			for(var i=popColl.length;i>=0;i--){
				if(i===0){
					if(maskColl.length>0){
						maskColl[0].close();
						delete maskColl[0];
						maskColl.splice(0,1);	
					}
					break;
				}
				if(!popColl[i-1]['noMask']){
					var pcount=i-1;
					var zidx=zindex+(pcount*10)+1;
					maskColl[0].setZindex(zidx);
					maskColl[0].setOpac(popColl[i-1].maskOpac);
					break;
				}
			}
			if(typeof __.closeFn==='function')__.closeFn();
			delete __;
		},
		setZindex:function(pobj){
			var pcount=popColl.length;
			var zidx=zindex+(pcount*10)+2;
			pobj.css({'z-index':zidx});
		},
		setPostion:function(pobj){
			var __=this;
			pobj.width(parseInt(__.width)+8);
			var width=pobj.width(),posi=__.calPostion(width);
			pobj.css(posi);
		},
		calPostion:function(width){
			var __=this;
			if(__.positionStyle==='auto'){
				var l=($body.width()-width)/2,
				t=$win.scrollTop() + $win.height()/ 5;	
				return {left:l,top:t};
			}else if(__.positionStyle==='define'){
				var l=__.left,t=__.top;
				return {left:l,top:t,right:__.right,bottom:__.bottom};
			}else{
				try{
					throw('error no '+__.positionStyle+' style');
				}catch(e){}
			}
			return {l:l,t:t};
		}
	};
	//----------------------
	var popbox=function(parm){
		var parms=init(parm);
		var pbox=new popFn(parms);
		return pbox;
	},
	toast=function(parm){
		var def={
			text:'请输入提示信息',
			timeout:1200,
			noTitle : true,
			width:210
		};
		$.extend(def,parm);
		var parms=init(def);
		parms.html=getToastTpl(parms.text);
		var pbox=new popFn(parms);
	},
	alert=function(parm,btnFn){
		var defaults = {
			text : '请输入提示信息', //内容文
			title:'提示',
			height : 'auto', //高度字
			width : 210,//宽度
			confirm:'确定',
			enhance:false,
			icontype:'ok' //ok||notice
		};
		$.extend(defaults,parm);
		var parms=init(defaults);
			parms.html=getalertTpl(parms.text,parms.confirm);
		var pbox=new popFn(parms);
		var ok= pbox.popobj.find('a[node-type=ok]');
		ok.bind('click',function(){
			(typeof btnFn==='function')&&btnFn();
			pbox.close();
			return false;
		});
		acenterTxt(pbox);
	},
	confirm=function(parm,okFn,cancelFn){
		var defaults = {
			title:'提示', //是否显示标题
			text : '请输入提示信息', //内容文
			height : 'auto', //高度字
			width : 220,//宽度
			confirm:'确定',
			cancel:'取消'
		};
		$.extend(defaults,parm);
		var parms=init(defaults);
		parms.html=getConfirmTpl(parms.text,parms.confirm,parms.cancel);
		var pbox=new popFn(parms);
		var ok= pbox.popobj.find('a[node-type=ok]'),cancel=pbox.popobj.find('a[node-type=cancel]');
		ok.bind('click',function(){
			(typeof okFn==='function')&&okFn();
			pbox.close();
			return false;
		});
		cancel.bind('click',function(){
			(typeof cancelFn==='function')&&cancelFn();
			pbox.close();
			return false;
		});
	},
	acenterTxt=function(pobj){
		tarea=pobj.popobj.find('.NY-con-alert-txt');
		if(tarea.height()>24){
			tarea.css({'text-align':'left'});
		}else{
			tarea.css({'text-align':'center'});
		}
	};
	
	exports.popbox=exports.popBox=popbox;
	exports.confirm=confirm;
	exports.toast=toast;
	exports.alert=alert;
	exports.version='0.2.1';

return exports;
  
});