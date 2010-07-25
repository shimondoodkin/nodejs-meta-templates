//////////////////////////////////////////////////////////////////////
//
// Double Template for Node.js by Shimon Doodkin, helpmepro1@gmail.com
// license: It's released under a BSD style license 
//
// http://github.com/shimondoodkin/nodejs-meta-templates
//
// the idea is to have a template like php mixed with html
// a template that processed twice, 
//  1st time prepeared with static data 
//  2nd time - each time a request is made.
// my requirement was a minimal learnign curve.
// the template is planed for nodejs to be prepeared once and used many times 

// i decided on <??> tags for runtime part of the template
// i decided on <%%> tags for prepeare part of the template

// example template:
// hello <? if(myvar) { ?><?=myvar?><? } else { ?> world<? }?>

// complex template example with paritials and recursion:
// a website with satic recusive menu and dynamic content in the center
//
//<html>
// <head><title>complex template example</title></head>
// <body>
//  <table width="100%" border="0" cellspacing="0" cellpadding="0">
//      <tr>
//        <td dir="rtl" style="padding:10px;text-align:right;direction:rtl"><?=content?></td>
//        <td dir="rtl" width="225" bgcolor="#ccd5f4" style="padding:10px;text-align:right;direction:rtl">
//         <%
//          function print_menu(menu1)
//          {
//           var echo; //redefine local echo variable
//           for(link in menu1)
//           {
//            echo+='<?link='+JSON.stringify(link)+'?>';
//            %>
//            <ul>
//             <li><a href="<?=link.href?>"><?=link.name?></a></li>
//             <%=print_menu(menu1)%>
//            </ul>
//            <%
//           }
//           return echo;
//          }
//          echo+=print_menu(menu); // echo is defined in the begining of the function and returned at the end of the function. 
//         %>
//        </td>
//      </tr>
//  </table>
//
// <%=this.templates.footer(vars); 
//  // vars is an argument of the template function,  it is extracted at the begining of function.
//  // it calls for other auto preloaded template paritial, with same variable you have in this function
//  // for more information see buildtemplate function below.
// %>
// </body>
//</html>
//

var fs = require('fs');    // lets open files
var sys = require('sys');    // lets open files

// to include in in nodejs i use:
// var te = require('doubletemplate');  //load double teplate module

//example of useing parsedir function:
// te.parsedir(__dirname+'/templates',{'app':app});

//in the code you use:
// te.templates['subdir/filename.html']({'app':app});
// also you could have dotnet like componetns if you do like:
// var localstate={};
// te.templates['subdir/filename.html']({'app':app,'localstate':localstate});

// the code is in stright forward logic you can read it and understand how it works.

function parsetemplate(str,opentag,closetag,filename)
{
 // license: It's released under a BSD style license, by Shimon Doodkin. http://kodtov.com helpmepro1@gmail.com 
 // this function chunks a string into an array 
 // obeing javascript syntax codes, strings and comments
 //
 // return EXAMPLE:
 // [         
 // {type:'code'     ,s:2  ,e:9  ,data:'if(true){ name="you" ' },
 // {type:'text'     ,s:25 ,e:36 ,data:'hello '                },
 // {type:'shortcut' ,s:13 ,e:23 ,data:'myvar'                 },
 // {type:'code'     ,s:39  ,e:40  ,data:'}'                   }
 // ]
 
 //errors: (not checked yet) 
 // closetag not opened - ignore
 // opentag not closed
 // string not closed
 // comment not closed
 // undefined variables: str,opentag,closetag

 //supports skip <?xml open tag if opentag is <? 
 //supports print out shourtcut  <?=
 
  var debugme;
  debugme=false;
  //debugme=(filename=='/var/www/nodejs-mongodb-app/templates/default/add.html');
 
 var result=[];//developed 5th - i used http://jsbeautifier.org/ to debug output
 var intag=false,instring1=false,instring2=false,inbackslash=0,incommentfull=false,incommentline=false,
     previuschar="",currentchar="",nextchar="",opentag_length=opentag.length,closetag_length=closetag.length,
     isshortcuttag=false;
 var codestart,tagstart,codeend,tagend,textstart=0,textend=-1;
 for(var i=opentag.length,str_length=str.length;i<str_length;i++)
 {
  currentchar=str.charAt(i);
  
  // match open tag
  if(!instring1 && !instring2 && !incommentfull && !incommentline) // developed 3rd
  {
   //if(debugme)
   // sys.puts('['+i+'] opentag match '+opentag+'=\''+str.substring(i-opentag_length,i)+"'");
   if(str.substring(i-opentag_length,i)==opentag) // developed 1st
   {
    // if(debugme)
    //  sys.puts('['+i+'] opentag matched');
         if(intag && instring1) {} // ignore while in string
    else if(intag && instring2) {} // ignore while in string
    else if(!intag)  // mark start
    {
     //if(debugme)
     // sys.puts('['+i+'] opentag ok');
     //support ignore opentag '<?' + 'xml' at the begining
     if(opentag=='<?') //developed 7th
     {
      if(i+3<str_length&&str.substr(i+1,3)=='xml')
      {
       previuschar=currentchar;
       continue;
      }
     }
     intag=true;
     tagstart=i-opentag_length;
     // if(debugme)
     // sys.puts('['+i+'] opentag pos '+tagstart);
     codestart=i;
     textend=tagstart;
     // if(debugme)
     //sys.puts('['+i+'] textstart'+textstart+'textend'+textend);
     if(textend-textstart>0)
     {
      // if(debugme)
      //sys.puts('['+i+'] text added');
      result[result.length]={type:'text',s:textstart,e:textend,data:str.substring(textstart,textend)}; // add the result to array 
     }
     codeend=-1;   //to get a runtime error if i do any misstake later
     tagend=-1;    // ...
     textstart=-1; // ...
     textend=-1;   //  ...
     //support shourtcut printout tag
     // developed 6th
     //sys.puts('['+i+'] shourtcut tag : '+str.charAt(i));
     if(i<str_length&&str.charAt(i) == '=')
     {
      isshortcuttag=true;
      i++;
      codestart++;
     } 
    }
    previuschar=currentchar;
    continue;
   }
  }

  // match close tag
  // developed 4th
  if(intag && !instring1 && !instring2 && !incommentfull ) /* removed: && !incommentline - we might be in a comment line */
  {
   //if(debugme)
   // sys.puts('['+i+'] closetag match '+closetag+'=\''+str.substring(i-opentag_length,i)+"'");
   if(str.substring(i-closetag_length+1,i+1)==closetag)
   {
    //if(debugme)
    // sys.puts('['+i+'] closetag ');
     
    codeend=i-opentag_length+1;
    tagend=i;
    result[result.length]={type:isshortcuttag?'shortcut':'code',s:codestart,e:codeend,data:str.substring(codestart,codeend)}; // add the result to array 
    intag=false;instring1=false;instring2=false;incommentfull=false;incommentline=false;
    codeend=-1; //to get a runtime error if i do any misstake later
    tagend =-1; //...
    textstart=i+1; 
    textend=-1  //...
    isshortcuttag=false;
    previuschar=currentchar;
    continue;
   }
  }
  
  // match ignore sematics
  if(intag) // developed 2nd
  {
   if( !incommentfull && !incommentline )
   {
    //if(debugme)
    // sys.puts('['+i+'] n incomment '+(instring1?'s1t ':'s1f ')+(instring2?'s2t ':'s2f '));

    if(inbackslash==2)inbackslash=0;
    //open tags
    // we can enter into a string only if we are not in a string and only if we are in a code. 
         if(intag && !instring1 && !instring2 && currentchar=='\''                    ) { instring1=true; }
    else if(intag && !instring1 && !instring2 && currentchar=='"'                     ) { instring2=true; } // while it is in a string it should ingnore the other  type string.
    else if(intag && !instring1 && !instring2 && previuschar=='/' && currentchar=='*' ) { incommentfull=true; } // while it is in a string it should ingnore the other  type string.
    else if(intag && !instring1 && !instring2 && previuschar=='/' && currentchar=='//') { incommentline=true; } // while it is in a string it should ingnore the other  type string.

    //a backslash
    // developed 8tn
    else if(intag && (instring1 || instring2 ) &&  currentchar=='\\' && i<str_length)
    {
     i++;
     previuschar=currentchar;
     continue;
    } // a backslash - ignore it+ skip an other char, it matched before \' and \"
    
    //close oppened tags
    // while we are in string1 we can be only closed by string1. while we in a comment we ignore everything until the end of the comment
    else if(intag && instring1 && currentchar=='\'' ) {instring1=false;}
    else if(intag && instring2 && currentchar=='"'  ) {instring2=false;}
    
   }
   else //continue close oppened tags
   {
    //  result[result.length]={type:'debug','i':i,'currentchar':currentchar,'previuschar':previuschar}; // add the result to array
    //if(debugme)
    // sys.puts('['+i+'] incomment ');
         if(intag && incommentfull && currentchar=='/'  && previuschar=='*'  ) {incommentfull=false;}
    else if(intag && !incommentfull && incommentline && (currentchar=='\r' || currentchar=='\n') ) {incommentline=false;}
   }
  }
  previuschar=currentchar;
 }
 textend=str_length; 
 if(textend-textstart>0)
  result[result.length]={type:'text',s:textstart,e:textend,data:str.substring(textstart,textend)}; // add the result to array 
 return result;
}this.parsetemplate=parsetemplate;

// is async mode possible?
// in general you can rewrite this function to make it asynchonius,
// instead of echo+=data, set up a call to function when data ready in async 
// but async functionality is not needed here. 
// because usualy all data is prebuild asynchroniusly and fast enught before calling this funcion.

function buildtemplate(template, templatename)
{
 //sys.puts(sys.inspect(template));

 //build template function, return it as string
 var result="";
 result+=" //"+templatename+"\r\n function(vars,callback) { ";  // define function
 result+="  var vars_i,echo=''; "; // returned text variable 
 //result+="  for(vars_i in vars) this[vars_i]=vars[vars_i]; "; // make items of vars local variables (i hope it works)
 result+="  for(vars_i in vars) { eval('var '+vars_i+'=vars[vars_i];'); } "; // make items of vars local variables // this might work better the the one above
 
 result+="  try { \r\n"; //add try to catch errors and not crush the entire application 
 var i,template_length;
 for(i=0,template_length=template.length;i<template_length;i++)
 {
  if(template[i]['type']=='code')     result+=            template[i]['data'] + '; \r\n';
  if(template[i]['type']=='shortcut') result+= ' echo+='+ template[i]['data'] + '; \r\n';
  if(template[i]['type']=='text')     result+= ' echo+='+ JSON.stringify(template[i]['data']) +'; \r\n';
 }
 
 if(!templatename)templatename=''; 
 result+=" }catch(e){ echo+=\"\\r\\nerror in template: "+templatename+"\\r\\n\"; echo+=e.stack;} "; // catch the error
 result+="  if(!callback) return echo; else callback(echo); "; // return echo variable
 result+=" } "; // end function definition
 
 //print_r the result
 //if(debugme) { sys.puts("template:  "+filename); sys.puts(sys.inspect(parsed)); }
 
 return  result;
}this.buildtemplate=buildtemplate;

function gettemplate1(template,filename,this_of_template,data)
{
 if(!this_of_template)this_of_template=this;
 try{
  var fntext=buildtemplate(parsetemplate(template,'<%','%>',filename),filename);
  eval('var fn = '+fntext,filename);
 }
 catch(e)
 {
  sys.puts(e.message+"\r\n\r\n"+fntext);
 }
 return data ? fn.call(this_of_template,data) :fn;
}this.gettemplate1=gettemplate1;

function gettemplate2(template,filename,this_of_template,data)
{
 if(!this_of_template)this_of_template=this;
 try{
  var fntext=buildtemplate(parsetemplate(template,'<?','?>'),filename);
  eval('var fn = '+fntext,filename);
 }
 catch(e)
 {
  sys.puts(e.message+"\r\n\r\n"+fntext);
 }
 return data ? fn.call(this_of_template,data) :fn;
}this.gettemplate2=gettemplate2;

function doubletemplate(template,filename,this_of_template,statictata) 
{
 //implement double templates idea: one for static data, one for dynamic data
 if(!statictata) statictata={};
 return gettemplate2(  gettemplate1(template,filename,this_of_template,statictata),filename,this_of_template);
}this.doubletemplate=doubletemplate;

function prepeare(function_template,filename,this_of_template,statictata) 
{
 //implement double templates idea: one for static data, one for dynamic data
 return gettemplate2(  function_template.call(this_of_template,statictata),filename,this_of_template ,statictata);
}this.prepeare=prepeare;


//run recusivly on a directory to load all templates in it.

var templates={}; this.templates=templates;
function parsedir(parsedirname,this_of_template,dataobject)
{
 //example:
 // te.parsedir(__dirname+'/templates',{'app':app});

 var parse_templates = function(dir, files,basedir)
 {
  if(basedir==null) basedir=dir;
  for (var i=0;i<files.length;i++)
  {
   var file = dir+'/'+files[i];
   (function()
    {
     var file_on_callback = file;
     //sys.puts('file assigned: '+ file_on_callback);
     fs.stat(file_on_callback,
     function(err,stats)
     {
      //sys.puts('stats returned: '+ file);
      if (err) throw err;
      if (stats.isDirectory())
       fs.readdir(file_on_callback,function(err,files){
        if (err) throw err;
        parse_templates(file_on_callback, files);
       });
      else if (stats.isFile()) //maybe remove this
      {
       var fileext=file_on_callback.substr(file_on_callback.length-4).toLowerCase()
       if( fileext=='.htm' || fileext=='html'  )
       {
        templates[file_on_callback.substr(basedir.length+1)]=doubletemplate(fs.readFileSync(file_on_callback),file_on_callback,this_of_template,dataobject);
        //debuging:
        //app.templates[file_on_callback.substr(basedir.length+1)]=buildtemplate(parsetemplate(fs.readFileSync(file_on_callback),'<%','%>'));
        //sys.puts("//template: "+file_on_callback.substr(basedir.length+1));
        //sys.puts(app.templates[file_on_callback.substr(basedir.length+1)]);
       }
      }
     });
    }
   )(); // This creates and executes a new function with its own scope.
  }
 };
 fs.readdir(parsedirname,function(err,files){ if (err) throw err; parse_templates(parsedirname, files,null);}); // add __dirname to watch list to restart server
}this.parsedir=parsedir;

/////////
function loadfile(file,this_of_template,dataobject,basedir)
{
 if(basedir==null) basedir=dir;
 //example:
 // doubletempaltes.loadfile(__dirname+'/templates/file.html',{'app':app});
  var file_on_callback = file;
  fs.stat(file_on_callback, function(err,stats){
   //sys.puts('stats returned: '+ file);
   if (err) throw err;
   if (!stats.isDirectory())
    fs.readdir(file_on_callback,function(err,files){
     if (err) throw err;
     parse_templates(file_on_callback, files);
     });
   else if (stats.isFile()) //maybe remove this
   {
    var fileext=file_on_callback.substr(file_on_callback.length-4).toLowerCase()
    if( fileext=='.htm' || fileext=='html'  )
    {
     templates[file_on_callback.substr(basedir.length+1)]=doubletemplate(fs.readFileSync(file_on_callback, encoding='utf8'),file_on_callback,this_of_template,dataobject);
    }
   }
  });
}this.loadfile=loadfile;

/////////
function loadtemplate(file,this_of_template,dataobject)
{
 return doubletemplate(fs.readFileSync(file, encoding='utf8'),file,this_of_template,dataobject);
}this.loadtemplate=loadtemplate;

// it lets you have mater tempalte applied in the later step
/////////load only the 1st stage of the template loading, 
//   to complete it later with second step, use:
//  doubletempaltes.prepeare(function_template,this_of_template,statictata)
// but this does not works with user's 2nd stepped templates, so i did not used it, isted i did 2 template calls; 
function loadtemplate1(file,this_of_template,statictata) //loadtemplate unprepeared
{
 return gettemplate1(fs.readFileSync(file, encoding='utf8'),file,this_of_template);
}this.loadtemplate1=loadtemplate1;

//htmlspecialchars htmlencode
function htmlencode( str ) {
  if(!str) return str;
  if(!str.replace) return str;
  c = {'<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#039;', '#':'&#035;' };
  return str.replace( /[<&>'"#]/g, function(s) { return c[s]; } );
} this.htmlencode=htmlencode;


function strip_tags (str, allowed_tags) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Luke Godfrey
    // +      input by: Pul
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +      input by: Alex
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Marc Palau
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Eric Nagel
    // +      input by: Bobby Drake
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Tomasz Wesolowski
    // *     example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>');
    // *     returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
    // *     example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
    // *     returns 2: '<p>Kevin van Zonneveld</p>'
    // *     example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
    // *     returns 3: '<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>'
    // *     example 4: strip_tags('1 < 5 5 > 1');
    // *     returns 4: '1 < 5 5 > 1'

    var key = '', allowed = false;
    var matches = [];
    var allowed_array = [];
    var allowed_tag = '';
    var i = 0;
    var k = '';
    var html = '';

    var replacer = function (search, replace, str) {
        return str.split(search).join(replace);
    };

    // Build allowes tags associative array
    if (allowed_tags) {
        allowed_array = allowed_tags.match(/([a-zA-Z0-9]+)/gi);
    }

    str += '';

    // Match tags
    matches = str.match(/(<\/?[\S][^>]*>)/gi);

    // Go through all HTML tags
    for (key in matches) {
        if (isNaN(key)) {
            // IE7 Hack
            continue;
        }

        // Save HTML tag
        html = matches[key].toString();

        // Is tag not in allowed list? Remove from str!
        allowed = false;

        // Go through all allowed tags
        for (k in allowed_array) {
            // Init
            allowed_tag = allowed_array[k];
            i = -1;

            if (i != 0) { i = html.toLowerCase().indexOf('<'+allowed_tag+'>');}
            if (i != 0) { i = html.toLowerCase().indexOf('<'+allowed_tag+' ');}
            if (i != 0) { i = html.toLowerCase().indexOf('</'+allowed_tag)   ;}

            // Determine
            if (i == 0) {
                allowed = true;
                break;
            }
        }

        if (!allowed) {
            str = replacer(html, "", str); // Custom replace. No regexing
        }
    }

    return str;
} this.strip_tags=strip_tags;