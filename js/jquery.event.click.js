// jquery.event.click.js
// 0.6
// Stephen Band
// 
// Project home
// webdev.stephband.info/events/click

(function(jQuery){

var undefined,                          // Speed up references to undefined
    regex = {
        empty:   /^#?$/,                // Single hash or empty string
        url:     /^[a-z]+:\/\//,        // Begins with protocol xxx://
        hash:    /^#/,                  // Begins with a hash
        slash:   /^\//                  // Begins with a slash
    };

function parseObj(str) {
    var array = str.split(/\s+/),
        i = array.length,
        obj = {};
            
    // Make object of targets based on data passed in
    while (i--) {
        obj[array[i]] = true;
    }
    
    return obj;
}

jQuery.event.special.click = {
    add: function(handler, data, namespaces) {
        if (data && (data.href || data.selector)) {
            var selector = data.selector || 'a[href]' ,
                hrefObj = data.href ? parseObj(data.href) : false ;
            
            // return a new function that will become the handler
            return function(e) {
                // Store reference to original target in case another 
                // click binding needs to use it
                if (!e.originalTarget) e.originalTarget = e.target;
                
                // Handle event delegation
                var targ = jQuery(e.originalTarget),
                    targData = targ.data("closest") || {},
                    link = targData[selector];
                
                if ( link === undefined ) {
                    link = targ.closest( selector, this );
                    link = ( link.length ) ? link : false ;
                    targData[selector] = link;
                    targ.data("closest", targData);
                }
                
                if ( link === false ) return;
                
                // Do some real work
                var linkData = link.data('target'),
                    hrefType = 'local',
                    ref, href;
                
                if (linkData) {
                    ref = linkData.ref;
                    href = linkData.href;
                    hrefType = linkData.hrefType;
                }
                else {
                    href = jQuery.trim( link.attr('href') );
                    
                    // Find out what hrefType this has
                    for (var i in regex) {
                        if (href.match(regex[i])) {
                            hrefType = i;
                            break;
                        }
                    }
                    
                    // Make ref from href
                    ref = regex[hrefType] ? href.replace(regex[hrefType], '') : href;
                    
                    link.data('target', {
                        ref: ref,
                        href: href,
                        hrefType: hrefType
                    });
                }
                
                // set and target
                e.target = link[0];
                e.targetData = {
                    href: href,
                    ref: ref
                };
                e.data = data;
                
                // Check if the href is of a type we're interested in,
                // (or whether the supplied href is an exact match for this link)
                if ( data.href ? (hrefObj[hrefType] || href === data.href) : true ) {
                    // and call the supplied handler and return its result
                    return handler.apply(this, arguments);
                }
            }
        }
        else { return handler; }
    }
};

})(jQuery);