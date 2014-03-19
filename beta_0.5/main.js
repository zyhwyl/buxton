'use strict';
var tmp=[];
var now_page_cache=[];
var now_page_position=0;
var nowPage=1;
var SCROLL_DIRECTION="down";
var scroll_lock=false;
var base_top=$("#list").offset().top;

$(function(){
  var awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Karma',
    'SitePoint',
    'Python基本程序设计（Python Elementary Programming）',
    '安装，配置和了解IDLE程序编辑/运行环境和Sublime Text 2 程序编辑器。',
    '提示：Sublime Text 2模式需要创建一个文件，保存为扩展名为.py文本文件。',
    '提示：请注意程序处理过程为输入，处理（转换）和输出。',
    '请将每一个步骤定义为一个函数，并使用input()函数。',
    '请定义两个函数分别处理按年收入和季度奖金计算养老金补充金额'
  ];

  //generate 1000 random data
  for(var i = 0;i<1000;i++){
    tmp.push(awesomeThings[~~(Math.random()*10)]+Math.random());
  }

  var pageHelper=new PageHelper(tmp);
  nowPage=pageHelper.getNowPageNo();
  pageHelper.initPageSelect(".pageNo");

  freshContent($("#list"),pageHelper.getNowDataList(),nowPage);

  //scroll load
  var page_height=$("#list").height();
  
  $(window).scroll(function(){
    var winH = $(window).height(); //页面可视区域高度  
    var pageH = $(document.body).height(); //页面总高度 
    var scrollT = $(window).scrollTop(); //滚动条top  
    var base_position=$(window).scrollTop()-base_top;
    if(now_page_position>$(window).scrollTop()){
      SCROLL_DIRECTION="up";
    }else{
      SCROLL_DIRECTION="down";
    }

    now_page_position=$(window).scrollTop();

    if(SCROLL_DIRECTION==="down"){
      for (var i = 0; i < now_page_cache.length; i++) {
        if(nowPage==now_page_cache[i].pageNo){
          page_height=now_page_cache[i].pageTop-now_page_cache[i].pageTop%100;
        }
      };
      //if now position > this page content`s height,page number++
      if(base_position>page_height){
        nowPage++;
      }
    }else if(SCROLL_DIRECTION==="up"){
      for (var i = 0; i < now_page_cache.length; i++) {
        //向上滚动时 检查出上一页是否存在
        if(nowPage==now_page_cache[i].pageNo){
          if(i-1>=0){
            page_height=now_page_cache[i-1].pageTop;
            //get the height of pre page,and if the base_position < the height of now page,page number-- 
            if(base_position<page_height){
              nowPage--;
              if(nowPage!=1){
                //上一页不存在 加载上一页
                if(now_page_cache[i].pageNo-1!=now_page_cache[i-1].pageNo){
                  loadAnimate();
                  scrollChangePage(pageHelper,"pre");
                }
              }
            }
          }
        }
      };
    }
    
    $(".pageNoBtn").removeClass("font-weight");
    $("#pageNoBtn"+nowPage).addClass("font-weight");

    var aa = (pageH-window.innerHeight-scrollT)/winH;
    if(aa<0.01){
      scrollChangePage(pageHelper,"next");
    }
  });
});

function scrollChangePage($pageHelper,$direction){
  if(!scroll_lock){
    scroll_lock=true;
    setTimeout(function(){
      scroll_lock=false;
      var _data;
      if($direction=="next"){
        _data=$pageHelper.goNextPage();
        var _now_scroll_top=$(window).scrollTop();
        freshContent($("#list"),_data,$pageHelper.getNowPageNo());
        $(window).scrollTop(_now_scroll_top);
      }
      else{
        _data=$pageHelper.goPrePage();
        freshContent($("#list"),_data,$pageHelper.getNowPageNo(),true);
      }
      closeLoadAnimate();
    },1000);
  }
}

function c(obj){
  console.log(obj);
}

function freshContent($wrap,$data,$pageNo,$goto){
  var is_cache_exist=false;
  var goto_page_top=0;
  //检查跳转的页面是否已经存在
  for (var i = 0; i < now_page_cache.length; i++) {
    if(now_page_cache[i].pageNo==$pageNo){
      is_cache_exist=true;
      if(i===0)
        goto_page_top=base_top;
      else
        goto_page_top=now_page_cache[i-1].pageTop;
    }
  }
  if(!is_cache_exist){
    $wrap.html("");
    now_page_cache = sortCache(now_page_cache,$pageNo,$data);
    for (var i = 0; i < now_page_cache.length; i++) {
      var _ulc=$("<ul/>");
      for (var j = 0; j < now_page_cache[i].pageData.length; j++) {
        _ulc.append("<li>"+now_page_cache[i].pageData[j]+"</li>");
      }
      _ulc.append("<li style='text-align:right;padding:5px;list-style:none;'>"+now_page_cache[i].pageNo+"</li>");
      _ulc.attr("page-no",now_page_cache[i].pageNo);
      $wrap.append(_ulc);
      _ulc.attr("top",_ulc.offset().top+_ulc.height());
      now_page_cache[i].pageTop=_ulc.offset().top+_ulc.height();
      if($pageNo===now_page_cache[i].pageNo&&$pageNo!==1){
        goto_page_top=now_page_cache[i-1].pageTop;
      }
    };
  }
  if($goto){
    $(window).scrollTop(goto_page_top);
    nowPage=$pageNo;
  }
  return true;
}

function sortCache($cache_list,$pageNo,$data){
  var _insert_flag=false;
  if($cache_list.length==0){
    $cache_list.push({pageNo:$pageNo,pageData:$data});
  }else{
    //遍历cache中的数据，如果当前页数，比当前遍历的节点的页数低，则将此页插入当前节点的前一节点
    for (var i = 0; i < $cache_list.length; i++) {
      if($pageNo<$cache_list[i].pageNo){
        $cache_list.splice(i,0,{pageNo:$pageNo,pageData:$data});
        _insert_flag=true;
        break;
      }
    };
    if(!_insert_flag){
      $cache_list.push({pageNo:$pageNo,pageData:$data});
    }
  }
  return $cache_list;
}

function loadAnimate(){
  var _wrap=$("<div class='loading_component' />");
  var _loading=$("<img class='loading_component' src='loading2.gif' />");
  _wrap.css({'position':'fixed','width':'100%','height':'100%','opacity':'0',
              'background':'#000','z-index':'999','top':'0','left':'0'});
  _loading.css({'position':'fixed','top':'45%','left':'50%','z-index':'9999'});
  $("body").append(_wrap).append(_loading);
  $("body").css({'overflow':'hidden'});
  _wrap.animate({'opacity':'0.5'},1000);
}

function closeLoadAnimate(){
  $(".loading_component").remove();
  $("body").css({'overflow-y':'scroll'});
}

var ScrollListener=(function(){
})();

var PageHelper=function($data){
  this.pageNo=1;
  this.pageLength=15;
  this.dataList=$data;
  this.prePage=1;
  this.nextPage=1;
  this.nowDataList=$data.slice(0,this.pageLength);
  this.pageCount=~~($data.length/this.pageLength)+1;
}

PageHelper.prototype={
  getNowPageNo:function(){return this.pageNo},
  getNowDataList:function(){return this.nowDataList},
  getTotalCount:function(){return this.dataList.length},
  getTotalPage:function(){return this.pageCount},
  goNextPage:function(){
    this.pageNo++;
    if(!this.gotoPage(this.pageNo)){
      this.pageNo--;
      return false;
    }
    return this.getNowDataList();
  },
  goPrePage:function(){
    this.pageNo--;
    if(!this.gotoPage(this.pageNo)){
      this.pageNo++;
      return false;
    }
    return this.getNowDataList();
  },
  gotoPage:function(pageNo){
    if(pageNo==0||this.pageNo>=this.pageCount){
      return false;
    }
    this.pageNo=pageNo;
    this.nowDataList = this.dataList.slice((this.pageNo-1)*this.pageLength,this.pageNo*this.pageLength);
    return true;
  },
  initPageSelect:function($wrap){
    var $this=this;
    if(this.pageCount>0&&this.pageCount<10){

    }else if(this.pageCount>=10){
      for(var i = 1; i < 10; i++) {
        $('<span class="pageNoBtn" id="pageNoBtn'+i+'" rel="'+i+'">'+i+'</span>').appendTo($wrap);
        $("#pageNoBtn"+i).click(function(){
          var tmpId=$(this).attr("rel");
          $this.gotoPage(tmpId);
          freshContent($("#list"),$this.getNowDataList(),$this.getNowPageNo(),true);
        });
      };
      $('<span class="pageNoBtn">...</span>').appendTo($wrap);
    }
  }
}