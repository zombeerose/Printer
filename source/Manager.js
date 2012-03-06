/**
 * @class Ext.ux.printer.Manager
 * @author Ed Spencer (edward@domine.co.uk)
 * Class providing a common way of printing Ext.Components. Ext.ux.printer.Manager.print delegates the printing to a specialised
 * renderer class (each of which subclasses Ext.ux.printer.renderer.Base), based on the xtype of the component.
 * Each renderer is registered with an xtype, and is used if the component to print has that xtype.
 * 
 * See the files in the renderers directory to customise or to provide your own renderers.
 * 
 * Example example:
 * 
        var grid = new Ext.grid.Panel({
            columns: [...],
            store   : //some store
        });

        Ext.ux.printer.Manager.print(grid);
 * 
 * @singleton
 */
Ext.define('Ext.ux.printer.Manager',function(){
    //private

    //public
    var pub = {
        singleton: true,
        
        /**
         * @property renderers
         * @type Object
         * An object in the form {xtype: RendererClass} which is manages the renderers registered by xtype
         */
        renderers: {
            'chart':       'Ext.ux.printer.renderer.Chart',
            'gridpanel':   'Ext.ux.printer.renderer.Grid',
            'panel':       'Ext.ux.printer.renderer.Panel',
            'treepanel':   'Ext.ux.printer.renderer.Tree'
        },
        
        /**
         * Returns the registered renderer for a given xtype
         * @param {String} xtype The component xtype to find a renderer for
         * @return {Ext.ux.printer.renderer.Base} The renderer instance for this xtype, or null if not found
         */
        getRenderer: function(xtype) {
            return this.renderers[xtype];
        }, //eof getRenderer
        
        
        /**
         * Prints the passed grid. Reflects on the grid's column model to build a table, and fills it using the store
         * @param {Ext.Component} component The component to print
         * @param {Object} cfg An optional config to apply to the renderer before printing.
         */
        print: function(component, cfg) {
            var xtypes = component.getXTypes().split('/'),
                i = xtypes.length - 1,
                renderer;
            
            //iterate backwards over the xtypes of this component, dispatching to the most specific renderer
            for (; i >= 0; i--){
                renderer = this.getRenderer(xtypes[i]);
                
                if (!Ext.isEmpty(renderer)){
                    Ext.Loader.require(renderer, function(){
                        var o = Ext.create(renderer, cfg || {});
                        o.print(component);
                    });
                    break;
                }
            }
        }, //eof print
        
        /**
         * Registers a renderer function to handle components of a given xtype
         * @param {String} xtype The component xtype the renderer will handle
         * @param {String} renderer The name of the renderer to invoke for components of this xtype
         */
        registerRenderer: function(xtype, renderer) {
            //this.renderers[xtype] = new (renderer)();
            //store the constructor fn() so the optional config can be applied per case
            this.renderers[xtype] = renderer;
        } //eof registerRenderer
        
    };
    return pub;
    
}()
); //eo class

//eo file