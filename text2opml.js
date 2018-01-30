function text2opml (wholeText,baseSpaceCount){
"use strict";

// if baseSpaceCount = 3,1 indent = 3 spaces = 1 Tab
var space = " ";
var bSCnt = parseInt(baseSpaceCount,10);
if (bSCnt == NaN || bSCnt < 1){
  bSCnt = 4;// 4 spaces
  };
for (i =1,l = bSCnt; i<l; i++){
  space += " ";
  };
  
var txt = wholeText;
// "\n" linux and iOS
var lines=txt.split("\n");
// texts with level info
var levary=[];

var dt=new Date();
var dateobj={
  "year":dt.getFullYear(),
  "month":dt.getMonth()+1,
  "date":dt.getDate(),
  "hour":dt.getHours(),
  "minute":dt.getMinutes(),
  };
// ex. "2018/1/25 13:25"
var datestr=
  dateobj.year +"/"+
  dateobj.month +"/"+
  dateobj.date +" "+
  dateobj.hour +":"+
  dateobj.minute ;
  
var tags={
  "head": 
    "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n<opml version=\"1.0\">\n<head>\n<title>"+ datestr +"</title>\n</head>\n<body>",
  "end": 
    "\n</body>\n</opml>\n "
};

// エスケープ文字の置き換え関数
function xml_escape(str) {
  str = str.replace(/&/g,"&amp;");
  str = str.replace(/"/g,"&quot;");
  str = str.replace(/'/g,"&apos;");
  str = str.replace(/</g,"&lt;");
  str = str.replace(/>/g,"&gt;");
  // str = str.replace(/\n/g,"&#xA;");
  return str;
};

// '#'の数でレベルを設定,無しなら0
function baseset(txt) {
    var num = 
    Number(txt.match(/^\s*(#*)/)[1].length);
    return num;
};

// インデントのカウント
function count(indent,base) {
    var base = (Number(base) || 0)
    var spc= indent.replace(/\t/g,space); //タブを空白に
    var len = space.length;//基本の空白量
    var num = (spc.match(/\s/g) || []).length/len;
    return Math.floor(num + base);
};
 
// 見出し未出現時の最低階層は0+1
var base = 0;

// インデントと本文を拾う正規表現

// 本文からlist markを削る
//var indtexp=/^(\s*)(?:[\+\-\*]\s)?(\S*.*)$/;

// list markを削らない
var indtexp=/^(\s*)(\S*.*)$/;


for ( var i = 0, l = lines.length ; i < l; i++ ) {
  var str=xml_escape(lines[i]);
  // indtexp.lastIndex=0;
  var ary = str.match(indtexp);
  if (baseset(str)==0 ){
    // '#'の見出し無し時
    //インデントの階層情報を格納。1が最小
    ary[1] =
    count(ary[1],base+1);
  }else{ // # 見出し有り
    // 見出しの階層情報を格納。
    base = baseset(str);
    ary[1] = base;
  };
  // 空行は無視
  if ((ary[0]).length !==0){
  levary.push(ary);
  };
};

// 全文無し時の処理
if (levary.length ==0){
  levary = [["",1,""]];
};


// 階層情報の解釈と整理
var pre = levary[0][1];
var scale = [];
for ( var i = 1, l = levary.length ; i < l; i++ ) {
  var lev = levary[i][1];
  var pp = pre +1;
  // 見出しか否か
  var hasH =
  baseset(levary[i][0]);
  if(hasH ==0 &&
  scale[lev] !== undefined 
  ){
    levary[i][1]= scale[lev];
    pre = scale[lev];
  }else if(hasH ==0 &&
  pp < lev){
    levary[i][1]=pp;
    scale[lev]=pp;
    pre = pp;
  }else if (hasH==0){
    scale[lev]=lev;
    pre = lev;
  }else{
    // 見出しの時はreset
    scale = [];
    pre = lev;
  };
};

//alert(levary.toString());

var parser = new DOMParser();
var dom = parser.parseFromString(tags.head + tags.end, "text/xml");
var body = (dom.getElementsByTagName("body"))[0];

// 新しい要素をつけ加える関数。levelで階層の相対位置を指定。
function appendnew(current,level,newnode){
  if (level <= 0){
    for (var i = 0 ,max 
    = (0 - level) ;
    i <= max ;i++){
      current =
      current.parentElement;
    };
    current.
    appendChild(newnode);
    return newnode;
  }else if (level >0){
    current.
    appendChild(newnode);
    return newnode;
  }else{
    return false;
  };
};

// テキストを収めたoutlineノードを作成する関数
function createOlnode (text){
  var newnode =
  dom.createElement("outline");
  newnode.
  setAttribute("text",text);
  return newnode;
};

// Domにノードを継いでゆく。
var current = body;
var prelev = 0;
for (var i = 0, l = levary.length;
i < l ; i++){
  var lv = levary[i][1] - prelev;
  var nextnode =
  createOlnode(levary[i][2]);
  current =
  appendnew (
  current,lv,nextnode);
  prelev = levary[i][1];
};
  
// opml テキストを得る。
var result = (new XMLSerializer()).
serializeToString(dom);
// 少し見栄え良く
result = result.replace(/(<\/*outline)/mg,"\n$1");

return result
};



