/**
 * Helper class to easily print the contents of a panel.
 * 
 * @class Ext.ux.printer.renderer.Panel
 * @extends Ext.ux.printer.renderer.Base
 * @author Ed Spencer
 * @constructor
 * @param {Object} config
 */
Ext.define('Ext.ux.printer.renderer.Panel', {
    extend: 'Ext.ux.printer.renderer.Base',

    /**
    * Generates the HTML fragment that will be rendered inside the <html> element of the printing window
    * @param {Ext.panel.Panel} panel 
    */
    generateBody: function(panel) {
        var body = Ext.String.format('<div class="x-panel-print">{0}</div>', panel.body.dom.innerHTML);
        return body.replace(/\r?\n/g,''); // 112111PC-Ext4.1PR1: a newline \n will cause an unterminated string error
    } //eof generateBody
});

//eo file