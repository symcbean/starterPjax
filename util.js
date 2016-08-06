if (jQuery.pjax) {
        /* initialize pjax - tell it which div to replace ... */
    jQuery(document).pjax('a', '#pjax_container');
    /* we don't have a window.onload event / jQuery.ready event
     * hence old plugins may needs some hacks to work. e.g. for
     * the googlemap3 plugin ....
    jQuery(document).on('pjax:start', function () { googleMapArray = new Array(); });
    jQuery(document).on('pjax:success', function () {
            if (googleMapArray.length) {
                 init_googlemap3();
            }
    });
    */
    /* hacks to make dokuwiki work  - these are things which would normally be called at window.onload */
    jQuery(document).on('pjax:success', register_pagetools);
    jQuery(document).on('pjax:success', (function () {
           initToolbar('tool__bar','wiki__text',toolbar);
    }));
}
/* the pages not loaded via pjax don't have a pjax success event */
jQuery(document).ready(register_pagetools);


function register_pagetools()
{
        jQuery('#toggle_pagetools').on('click',function(e) {
                var el=document.getElementById('controls');
                if (el) {
                        if ('none'==el.style.display) {
                                el.style.display='block';
                        } else {
                                el.style.display='none';
                        }
                }
        });
}
// compatability hacks.....
if (!window.console) console = {log: function() {}};

