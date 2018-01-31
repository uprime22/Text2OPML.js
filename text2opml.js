function text2opml (wholeText,baseSpaceCount){
"use strict";
//if baseSpaceCount=3,1indent=3spaces=1Tab
//default:4
var space = " ";
var bSCnt = parseInt(baseSpaceCount,10);
if (bSCnt == NaN || bSCnt < 1){
  bSCnt = 4;
  };
for (i =1,l = bSCnt; i<l; i++){
  space += " ";
  }; 
var txt = wholeText;
// NewLineCode "\n" :linux and iOS
var NLc =
(function (str){
  if(str.indexOf("\r\n")>-1){return "\r\n";}
  else if(str.indexOf("\n")>-1){return "\n";}
  else if(str.indexOf("\r")>-1){return "\r";}
    })(txt);
var lines=txt.split(NLc);
// texts with depth level info
var levary=[];
var dt=new Date();
// for time stamp
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
// opml tags
var tags={
  "head": 
    "<?xml version=\"1.0\" encoding=\"utf-8\" ?>"+NLc+"<opml version=\"1.0\">"+NLc+"<head>"+NLc+"<title>"+ datestr +"</title>"+NLc+"</head>"+NLc+"<body>",
  "end": 
    NLc+"</body>"+
    NLc+"</opml>"+NLc
};
// escape in text
function xml_escape(str) {
  str = str.replace(/&/g,"&amp;");
  str = str.replace(/"/g,"&quot;");
  str = str.replace(/'/g,"&apos;");
  str = str.replace(/</g,"&lt;");
  str = str.replace(/>/g,"&gt;");
  // str = str.replace(/\n/g,"&#xA;");
  return str;
};
// Count '#'
function baseset(txt) {
    var num = 
    Number(txt.match(/^\s*(#*)/)[1].length);
    return num;
};
// Count indent + base
function count(indent,base) {
    var base = (Number(base) || 0)
    var spc= indent.replace(/\t/g,space); //Tab→space
    var len = space.length;
    var num = (spc.match(/\s/g) || []).length/len;
    return Math.floor(num + base);
};
// RegularExp.
// Cut list marks
//var indtexp=/^(\s*)(?:[\+\-\*]\s)?(\S*.*)$/;
// Remain list marks
var indtexp=/^(\s*)(\S*.*)$/;

// depth level number:  "# hoge" =1, "foo"=> 0+1
var base = 0;
for ( var i = 0, l = lines.length ; i < l; i++ ) {
  var str=xml_escape(lines[i]);
  // indtexp.lastIndex=0;
  var ary = str.match(indtexp);
  if (baseset(str)==0 ){
    // there is no #head
    // set depth level number =>1
    ary[1] =
    count(ary[1],base+1);
  }else{ // the line has '#'s
    base = baseset(str);
    ary[1] = base;
  };
  // get rid of blank line and set depth numbers
  if ((ary[0]).length !==0){
  levary.push(ary);
  };
};
// for empty text
if (levary.length ==0){
  levary = [["",1,""]];
};
// readjust depth level numbers
var pre = levary[0][1];
var scale = [];
for ( var i = 1, l = levary.length ; i < l; i++ ) {
  var lev = levary[i][1];
  var pp = pre +1;
  // header or not
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
    // reset when header
    scale = [];
    pre = lev;
  };
};

// test
//alert(levary.toString());

var parser = new DOMParser();
var dom = parser.parseFromString(tags.head + tags.end, "text/xml");
var body = (dom.getElementsByTagName("body"))[0];
// add new node with level
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
// create outline nodes
function createOlnode (text){
  var newnode =
  dom.createElement("outline");
  newnode.
  setAttribute("text",text);
  return newnode;
};
// graft nodes
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
// get opml text
var result = (new XMLSerializer()).
serializeToString(dom);
// for look
result = result.replace(/(<\/*outline[^>]*>)/mg,"$1"+NLc);

return result
};



