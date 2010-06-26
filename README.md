## Meta templates / Double Template for Node.js by Shimon Doodkin, helpmepro1@gmail.com http://github.com/shimondoodkin/nodejs-meta-templates
 
 i have checked many  templates and not found a really stright forwared simple templets script.
 so i decided to write my own.
 
 the idea is to have a template like php mixed with html
 a template that processed twice, 
 * 1st time prepeared with static data 
 * 2nd time - each time a request is made.
 the template is compiled at runtime when preloaded in to a simple javascript funciton. 

 my requirement was a minimal learning curve.
 the template is planed for nodejs to be prepeared once and used many times 

 i decided on `<??>` tags for runtime part of the template
 i decided on `<%%>` tags for prepeare part of the template

### example template:
      hello <? if(myvar) { ?><?=myvar?><? } else { ?> world<? }?>

 a complex template example with calling other template and recursion:
 a website with satic recusive menu and dynamic content in the center

     <html>
      <head><title>complex template example</title></head>
      <body>
       <table width="100%" border="0" cellspacing="0" cellpadding="0">
           <tr>
             <td dir="rtl" style="padding:10px;text-align:right;direction:rtl"><?=content?></td>
             <td dir="rtl" width="225" bgcolor="#ccd5f4" style="padding:10px;text-align:right;direction:rtl">
              <%
               function print_menu(menu1)
               {
                var echo; //redefine local echo variable
                for(link in menu1)
                {
                 echo+='<?link='+JSON.stringify(link)+'?>';
                 %>
                 <ul>
                  <li><a href="<?=link.href?>"><?=link.name?></a></li>
                  <%=print_menu(menu1)%>
                 </ul>
                 <%
                }
                return echo;
               }
               echo+=print_menu(menu); // echo is defined in the begining of the function and returned at the end of the function. 
              %>
             </td>
           </tr>
       </table>

      <%=this.templates.footer(vars); 
       // vars is an argument of the template function,  it is extracted at the begining of function.
       // it calls for other template , with same variable you have in this function
       // for more information see buildtemplate function below.
      %>
      </body>
     </html>



### to include in in nodejs i use:
      //  require.paths.unshift(__dirname); //make local paths accecible
      //  require('filename')  // include file - filename is without '.js' extention!!!
      // var fs = require('fs');    // lets open files
      var te = require('doubletemplate');  //load double teplate module
      var doubletemplate=te.doubletemplate; // export double template function to global

### example of useing `parsedir` function:
      te.parsedir(fs,__dirname+'/templates',{'app':app});

### in the code you use:
      te.templates['subdir/filename.html']({'app':app});
also you could have dotnet like componetns if you do like:
      var localstate={};
      te.templates['subdir/filename.html']({'app':app,'localstate':localstate});

the code is in stright forward logic you can read it and understand how it works.



### todo:
to add parsing of first ; position for output shortcut tag to allow easyier convertion to non bloking style if needed.  
later i plan to rewrite it to support html paritials with sizzle css selector. like styling html with paritial html.
later i plan to enhance the api and the module structure.
for now what i we have here is enought for me.