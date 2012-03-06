/**
 * Abstract base renderer class. Don't use this directly, use a subclass instead.
 * 
 * @class Ext.ux.printer.renderer.Base
 * @extends Object
 * @author Ed Spencer
 * @author pscrawford
 * @constructor
 * @param {Object} config
 */
Ext.define('Ext.ux.printer.renderer.Base', {
    requires: [
        'Ext.ux.printer.Manager'
    ],

    
    /**
     * @cfg {Boolean} autoClose 
     * Indicates if the window will automatically close as soon as it prints.
     * Defaults to true.
     */
    autoClose: true,
    /**
     * @cfg {String} baseCls 
     * The base CSS class applied to the document body.
     * Defaults to 'dvp-printer'
     */
    baseCls: 'dvp-printer',
    /**
    * @cfg {Array} defaultStyleSheets
    * @property defaultStyleSheets
    * @type Array
    * The default stylesheets that will be included for every generation.
    */
    defaultStyleSheets: ['/resources/css/printer.css'], 
//        'stylesheets/print.css'    
    /**
    * @cfg {String} docType
    * The full html doctype tag. 
    * Defaults to strict.
    */
    docType: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">', 
        //'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
    
    /**
    * @cfg {String/Array} styleSheets 
    * Pass a string for a single stylesheet href or an array of hrefs to apply to the document.
    */

    /**
     * @param {Object} config
     */
    constructor: function(config){
        var me = this;
        
        Ext.apply(me,config||{});
        
        me.styleSheets = Ext.Array.merge(Ext.Array.from(me.defaultStyleSheets),Ext.Array.from(me.styleSheets));
    }, //eof constructor
    
    /**
     * @private
     * Check if style is loaded and do print afterwards
     * @param {window} win
     */
    doPrintOnStylesheetLoad: function(win) {
        var el,comp;
        
        try {
            el = win.document.getElementById('csscheck');
            comp = el.currentStyle || getComputedStyle(el, null);
        } catch (e1){
            return; //the document may be closed (IE)
        }
        
        if (comp.display !== "none") {
            Ext.Function.defer(this.doPrintOnStylesheetLoad,10, this, [win]);
            return;
        }
        win.print();
        
        if (this.autoClose){
            win.close();
        }
    }, //eof doPrintOnStylesheetLoad

    /**
     * @private
    * Generates the HTML Markup which wraps whatever this.generateBody produces
    * @param {Ext.Component} component The component to generate HTML for
    * @return {String} An HTML fragment to be placed inside the print window
    */
    generateHTML: function(component) {
        var me = this,
            styleLinks = '',
            tpl = '<link href="{0}" rel="stylesheet" type="text/css" media="screen,print" />',
            ss = Ext.Array.from(me.styleSheets),
            i = 0;
            
        for (; i < ss.length; i++) {
            styleLinks += Ext.String.format(tpl, ss[i]);
        }
        
        return Ext.create('Ext.XTemplate',
            me.docType +
            '<html>' +
                '<head>' +
                    '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />' +
                    styleLinks +
                    '<title>' + me.getTitle(component) + '</title>' +
                '</head>' +
                '<body class="' + me.baseCls + '">' +
                    '<div id="csscheck"></div>' +
                    me.generateBody(component) +
                '</body>' +
            '</html>'
        ).apply(me.prepareData(component));
    }, //eof generateHTML

    /**
    * Returns the HTML that will be placed into the print window. This should produce HTML to go inside the
    * <body> element only, as <head> is generated in the print function
    * @param {Ext.Component} component The component to render
    * @return {String} The HTML fragment to place inside the print window's <body> element
    */
    generateBody: Ext.emptyFn,
    
    /**
    * Returns the title to give to the print window
    * @param {Ext.Component} component The component to be printed
    * @return {String} The window title
    */
    getTitle: function(component) {
        return Ext.isFunction(component.getTitle) ? component.getTitle() : (component.title || "Printing");
    }, //eof getTitle    
    
    /**
    * Prepares data suitable for use in an XTemplate from the component 
    * @param {Ext.Component} component The component to acquire data from
    * @return {Array} An empty array (override this to prepare your own data)
    */
    prepareData: function(component) {
        return [];
    }, //eof prepareData
    
    /**
    * Prints the component
    * @param {Ext.Component} component The component to print
    */
    print: function(component) {
        var name = component && component.getXType
            ? Ext.String.format("print_{0}_{1}", component.getXType(), component.id.replace(/(-| )/g,'_')) //the name can not contain spaces or hypens
            : "print",
            
            html = this.generateHTML(component),
            win = window.open('', name);
            
        if (!win){ return; }
        
        win.document.write(html);
        // gecko looses its document after document.close(). but fortunally waits with printing till css is loaded itself
        if (Ext.isGecko) {
            win.print();
            if (this.autoClose){
                win.close();
            }
            return;
        }            
        
        win.document.close();
        
        Ext.Function.defer(this.doPrintOnStylesheetLoad, 10, this, [win]);
    } //eof print

}); //eo extend

//eo file