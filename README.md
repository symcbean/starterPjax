# StarterPjax Template for Dokuwiki #

## About ##

The template is part of a proof-of-concept for a set of changes aimed at:
 * improving performance
 * integrating Dokuwiki more closely with Javascript
 * improving security
While it's quite usable as a template, it is presented to demonstrate how to integrate PJAX loading.

Much of the javascript integration is provided via the Jokuwiki plugin. This is also designed to eliminate the need for inline Javascript, allowing for a strict [Content Security Policy](http://www.w3.org/TR/CSP/). 

The performance improvements come from [PJAX](https://github.com/defunkt/jquery-pjax). PJAX replaces page links with ajax calls, thereby only loading the part of the content which has changed between pages - but there's no need to make extensive changes to a page to enable this - just add a div around the content you want to replace on navigation and include the javascript. In the case of the Starter template, the variable content is really everything you can see on the screen, so there's not a big bandwidth saving. And of course, the limiting factor for HTTP performance is all about latency, right? Actually a large part of Dokuwiki's page loading time is now taken up by parsing, compiling and invoking Javascript. Not reinitializing the Javascript on each page leads to big savings - on 'localhost' I see a reduction of around 75% or 450 milliseconds.


The standard scripts alone are adding around 450msec to the page load times. But this is compounded by the standard scripts being loaded at the top of the html; the user is left with a blank screen for nearly half a second. Dokuwiki is designed to downgrade gracefully on browsers which don't support javascript (or where it's disabled) hence it all still works when the scripts are moved to the bottom (or declared with a defer tag) with the exception of the editor toolbar - but that's a simple fix. In the case of this template, a Jokuwiki widget is injected to start up the toolbar.

Note that PJAX, in addition to setting a custom request header, appends an extra query parameter to the URL, hence, leaving aside the issue of the breadcrumbs and edit links, there will be no cache conflicts between partial and full pages if HTTP caching of HTML content is enabled by the template. NB please exercise caution with HTTP caching - his has not been thouroughly evaluated.

PJAX can also intercept and handle form GETs and POSTs, but this is not enabled in the profile. The Jokuwiki plugin will disable PJAX after 200 consecutive page loads (performing a full page load , then reverting to PJAX loads for another cycle) to pre-empt any memory leaks (see the maxPjax setting in the Jokuwiki script.js).

## Additional Configuration ##

The template implements a fairly strict security policy which will break most non-jokuwiki plugins relying on Javacript. Currently this requires the source code for main.php to be edited to relax the policy.

PJAX improves performance of moving between pages on the wiki, but to improve the performance of the first page the user hits, then the loading of the Dokwuiki Javascript must be delayed. This required changes to the Dokuwiki source code to add a defer tag to the script tag.

**NB** while defer does not provide as much of a performance benefit as async, if the functionality is split across more than one javascript file then the sequence of loading may not be maintained - hence use defer in script tags rather than async unless you know that there no inter-dependencies in the separate files.

## Customization ##

For sidebar and colour schemes see the [Starter template documentation](http://www.dokuwiki.org/template:starter).

## Code ##

The code below is the **diff** between Anika's Starter template and one with added PJAX/Jokuwiki support
```diff
12a13,16
> if ('true'!=$_SERVER['HTTP_X_PJAX']){
>     /* really the template should expose control over the policy via the admin page....*/
>     header("Content-Security-Policy: default-src 'self'; script-src https://apis.google.com; frame-src https://youtube.com");
> }
14a19
> if ('true'!=$_SERVER['HTTP_X_PJAX']){
40d44
<         <?php html_msgarea() /* occasional error and info messages on top of the page */ ?>
42c46,47
<
---
>       <div id="pjax_container">
> <?php } /* end of non-pjax header */ ?>
43a49,56
>         <div id='pjaxTitle'
>         data-jw='{ "jokuwiki" : "pjaxTitle", "data" : { "id" : "pjaxTitle", "title" : "<?php
>               $pjaxTitle=htmlentities(tpl_pagetitle($ID, true) . ' [' . strip_tags($conf['title']). ']');
>               echo $pjaxTitle;
>             ?>"}}'
>           class='pjaxTitle'
>           style='display:none'></div>
>         <!-- the div above implements a jokuwiki to update the window title -->
45c58,62
<
---
>             <?php html_msgarea() /*
>             * occasional error and info messages on top of the page
>             * NB this is moved down inside the pjax container compared
>             * with the standard template
>             */ ?>
60d76
<
63c79
<                 <?php if ($conf['useacl'] && $showTools): ?>
---
>                 <?php if ($conf['useacl'] && $showTools){ ?>
82c98
<                 <?php endif ?>
---
>                 <?php } ?>
107d122
<
168c183,185
<
---
>         <div class="no"><?php tpl_indexerWebBug() /* provide DokuWiki housekeeping, required in all templates */ ?></div>
> <?php if ('true'!==$_SERVER['HTTP_X_PJAX']) { ?>
>        </div><!-- pjax container -->
171,172c188,189
<
<     <div class="no"><?php tpl_indexerWebBug() /* provide DokuWiki housekeeping, required in all templates */ ?></div>
---
>     <script src="<?php print DOKU_TPL . 'jquery.pjax.js'; ?>" defer="defer"></script>
>     <script src="<?php print DOKU_TPL . 'util.js'; ?>" defer="defer"></script>
175a193
> <?php } /* end of non-pjax footer */
```
Note that for clarity I have deliberately kept jquery.pjax.js (the unmolested PJAX code) and util.js (the glue between PJAX and Dokuwiki) in seperate files.

## Speeding up the first page ##

While PJAX speeds moving between pages, it doesn't help with the speed of the first page the user arrives at. But with Jokuwiki and the utils.js file from this template, it's possible to defer loading the javascript - so far I've not run into any problem with this, if you do, please let me know. This requires a small change to inc/template.php: in tpl_metaheaders(), added a defer attribute to the external javascript:

```php
            $head['script'][] = array(
                    'type'=> 'text/javascript', 'charset'=> 'utf-8', '_data'=> '',
                    'src' => DOKU_BASE.'lib/exe/js.php'.'?tseed='.$tseed,
                    'defer' => 'defer'
            );
```

## To Do ##

 * Provide an admin interface to updating the Security Policy
 * Currently, for clarity, the template keeps the Dokuwiki (lib/exe/js.php), PJAX (jquery.pjax.js) and integration code (util.js) in 3 seperate URLs (the Jokuwiki plugin code is merged into the Douwiki javascript file). The PAJX and integration javascript should be merged into the Dokuwiki Javascript file.
 * The starter template has a single line of inline javascript (which is probably not required) which should be removed before you add a CSP violation URL.
 * Document the places where Dokuwiki uses inline javascript (e.g. inc/html.php) and develop Jokuwiki base alternatives.

## Version History ##

 * 2013-06-27 -- v1 finalized

