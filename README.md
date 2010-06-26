## Meta templates / Double Template for Node.js
 
 I have checked many templates and not found a really stright forwared simple templets script.
 So i decided to write my own.
 
The idea is to have a template like php mixed with html.

A template that processed twice: 

* 1st time prepeared with static data 
* 2nd time - each time a request is made.

 The template is compiled at runtime when preloaded in to a simple javascript funciton. 

 My requirement was a minimal learning curve.

 The template is planed for nodejs to be prepeared once and used many times.

 I decided on `<??>` tags for runtime part of the template.

 I decided on `<%%>` tags for prepeare part of the template.

### example template:
      hello <? if(myvar) { ?><?=myvar?><? } else { ?> world<? }?>

 A complex template example with calling other template and recursion,

 A website with satic recusive menu and dynamic content in the center

     <html>
      <head><title>complex template example</title></head>
      <body>
       <table width="100%" border="0" cellspacing="0" cellpadding="0">
           <tr>
             <td dir="rtl" style="padding:10px;text-align:right;direction:rtl">
             
             <?=content?>
             
             </td>
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
               echo+=print_menu(menu); // echo is defined in the begining of the function 
                                       // and returned at the end of the function. 
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



### to include in in nodejs I use:
      var te = require('doubletemplate');  //load double teplate module
or
      var loadtemplate=require('doubletemplate').loadtemplate; // only load template function

### example of using `parsedir` function:
      te.parsedir(__dirname+'/templates',{'app':app});

### example of using `loadfile` function:
      te.loadfile(__dirname+'/templates/filename.html',{'app':app},__dirname);

### in the code you can use:
      te.templates['subdir/filename.html']({name:'your name'});

### example of using `loadtemplate` function:
      var mytemplate=te.loadtemplate(__dirname+'/templates/filename.html',{'app':app});
      mytemplate({name:'your name'});

the code is in stright forward logic you can read it and understand how it works.

### todo:
* to add parsing of first ; position for output shortcut tag to allow easier convertion to non bloking style if needed.  
* later I plan to rewrite it to support html paritials with sizzle css selector. like styling html with paritial html.
* later I plan to enhance the api and the module structure.
for now what is here is enought for me.

by Shimon Doodkin, helpmepro1@gmail.com http://github.com/shimondoodkin/nodejs-meta-templates
