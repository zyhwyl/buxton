'use strict';

$(function(){
  var tmp=[];
  var now_page_cache=[];
  var now_page_position=0;
  var SCROLL_DIRECTION="down";
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
  var nowData=pageHelper.getNowDataList();
  var nowPage=pageHelper.getNowPageNo();
  pageHelper.initPageSelect(".pageNo");

  now_page_cache.push(appendContent($("#list"),nowData,nowPage));

  //scroll load
  var scroll_lock=false;
  var base_top=$("#list").offset().top;
  var page_height=$("#list").height();
  var winH = $(window).height(); //页面可视区域高度  
  var pageH = $(document.body).height(); //页面总高度 
  var scrollT = $(window).scrollTop(); //滚动条top  
  $(window).scroll(function(){
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
          page_height=now_page_cache[i].pageTop;
        }
      };
      //if now position > this page content`s height,page number++
      if(base_position>page_height){
        nowPage++;
      }
    }else{
      for (var i = 0; i < now_page_cache.length; i++) {
        if(nowPage==now_page_cache[i].pageNo){
          if(i-1>=0){
            page_height=now_page_cache[i-1].pageTop;
            //get the height of pre page,and if the base_position < the height of now page,page number-- 
            if(base_position<page_height){
              nowPage--;
            }
          }
        }
      };
    }
    
    $("#pageNo").text(nowPage);
    var aa = (pageH-winH-scrollT)/winH; 
    if(aa<0.01){
      if(!scroll_lock){
        scroll_lock=true;
        setTimeout(function(){
          scroll_lock=false;
          var _data=pageHelper.goNextPage();
          now_page_cache.push(appendContent($("#list"),_data,pageHelper.getNowPageNo()));
        },1000);
      }
    }
  });
});

function c(obj){
  console.log(obj);
}

function appendContent($wrap,$data,$pageNo){
  var _ulc=$("<ul/>");
  for (var i = 0; i < $data.length; i++) {
    _ulc.append("<li>"+$data[i]+"</li>");
  }
  _ulc.attr("page-no",$pageNo);
  $wrap.append(_ulc);
  _ulc.attr("top",_ulc.offset().top+_ulc.height());
  return {pageNo:$pageNo,pageTop:_ulc.offset().top+_ulc.height()};
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
          $this.pageNo=tmpId;
          $("#gotoBtn").click();
        });
      };
      $('<span class="pageNoBtn">...</span>').appendTo($wrap);
    }
  }
}