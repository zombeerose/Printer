/**
 * Helper class to easily print the contents of a chart.
 * 
 * @class Ext.ux.printer.renderer.Chart
 * @extends Ext.ux.printer.renderer.Base
 * @author Phil Crawford
 * @constructor
 * @param {Object} config
 */
Ext.define('Ext.ux.printer.renderer.Chart', {
    extend: 'Ext.ux.printer.renderer.Base',

    /**
    * Generates the HTML fragment that will be rendered inside the <html> element of the printing window
    * @param {Ext.panel.Panel} panel 
    */
    generateBody: function(panel) {
        return Ext.String.format("<div class='x-chart-print'>{0}</div>", panel.el.dom.innerHTML);    
    } //eof generateBody
});

//eo file