'use strict';

$(function(){
  var tmp=[];
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

  for (var i = 0; i < nowData.length; i++) {
    $("#list").append("<li>"+nowData[i]+"</li>");
  }

  //scroll load
  var scroll_lock=false;
  var basic_top=$("#list").offset().top;
  var page_height=$("#list").height();
  $(window).scroll(function () {
    c($(window).scrollTop());
      /*判断窗体高度与竖向滚动位移大小相加 是否 超过内容页高度*/
      if (($(window).height() + $(window).scrollTop()) >= $("body").height()){
        if(!scroll_lock){
          scroll_lock=true;
          setTimeout(function(){
            scroll_lock=false;
            $(".gotoNext").click();
          },1000);
        }
      }
  });
  c(basic_top)
});

function c(obj){
  console.log(obj);
}

function refreshContent($wrap){

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