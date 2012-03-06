/**
 * Helper class to easily print the contents of a grid. Will open a new window with a table where the first row
 * contains the headings from your column model, and with a row for each item in your grid's store. When formatted
 * with appropriate CSS it should look very similar to a default grid. If renderers are specified in your column
 * model, they will be used in creating the table. Override headerTpl and bodyTpl to change how the markup is generated.
 * 
 * @class Ext.ux.printer.renderer.Grid
 * @extends Ext.ux.printer.renderer.Base
 * @author Ed Spencer
 * @author pscrawford
 * @constructor
 * @param {Object} config
 */
Ext.define('Ext.ux.printer.renderer.Grid', {
    extend: 'Ext.ux.printer.renderer.Base',
    
   /**
    * @property bodyTpl
    * @type Ext.XTemplate
    * The XTemplate used to create each row. This is used inside the 'print' function to build another XTemplate, to which the data
    * are then applied (see the escaped dataIndex attribute here - this ends up as "{dataIndex}")
    */
    bodyTpl: [
        '<tr>',
            '<tpl for=".">',
                '<tpl if="dataIndex">',
                    '<td>\{{dataIndex}\}</td>',
                '</tpl>',
            '</tpl>',
        '</tr>'
    ],  
  
   /**
    * @property headerTpl
    * @type Ext.XTemplate
    * The XTemplate used to create the headings row. By default this just uses <th> elements, override to provide your own
    */
    headerTpl: [
        '<tr>',
            '<tpl for=".">',
                '<tpl if="dataIndex">',
                    '<th>{text}</th>',
                '</tpl>',
            '</tpl>',
        '</tr>'
    ],
 
    /**
     * @property rowBodySelector
     * @type String
     * Defaults to '.x-grid-rowbody'
     */
    rowBodySelector: '.x-grid-rowbody',
    /**
     * @property rowBodyParentSelector
     * @type String
     * Defaults to '.x-grid-rowbody-tr'
     */
    rowBodyParentSelector: '.x-grid-rowbody-tr',
    
    /**
    * Generates the body HTML for the grid
    * @param {Ext.grid.Panel} grid The grid to print
    */
    generateBody: function(grid) {
        var columns = this.getColumns(grid),
            headerTpl = this.headerTpl.isTemplate ? this.headerTpl : this.headerTpl = Ext.create('Ext.XTemplate',this.headerTpl),
            bodyTpl = this.bodyTpl.isTemplate ? this.bodyTpl : this.bodyTpl = Ext.create('Ext.XTemplate',this.bodyTpl),
            //use the headerTpl and bodyTpl XTemplates to create the main XTemplate below
            headings = headerTpl.apply(columns),
            body     = bodyTpl.apply(columns),
            table = [
                '<table>',
                  '<thead>{0}</thead>',
                  '<tpl for=".">{1}',
                    '<tpl if="rowBody">',
                      '<tr><td colspan={2}>{rowBody}</td></tr>',
                    '</tpl>',
                  '</tpl>',
                '</table>'
            ].join('')
        
        return Ext.String.format(table, headings, body, columns.length);
    }, //eof generateBody
  
    /**
    * Prepares data from the grid for use in the XTemplate
    * @param {Ext.grid.Panel} grid The grid panel
    * @return {Array} Data suitable for use in the XTemplate
    */
    prepareData: function(grid) {
        //We generate an XTemplate here by using 2 intermediary XTemplates - one to create the header,
        //the other to create the body (see the escaped {} below)
        var columns = this.getColumns(grid),
            //build a useable array of store data for the XTemplate
            data = [],
            bodies = grid.getEl().query(this.rowBodyParentSelector) || [],
            ds = grid.store,
            view = grid.getView(),
            rb,
            el;
            
        ds.each(function(item, rowIdx) {
            var convertedData = {};
            
            //apply renderers from column model
            Ext.iterate(item.data, function(key, value) {
                Ext.each(columns, function(column,colIdx) {
                    if (column.dataIndex == key) {
                        convertedData[key] = column.renderer ? column.renderer.call(column.scope || this, value, {}, item, rowIdx, colIdx, ds, view) : value;
                        return false;
                    }
                }, this);
            });
            
            rb = null;
            if (bodies.length){
                el = Ext.get(bodies[rowIdx]); 
                if (el && el.isVisible()){
                    el = el.down(this.rowBodySelector);
                    rb = el ? el.dom.innerHTML : null;
                }
            }
            convertedData['rowBody'] = rb;
            
            data.push(convertedData);
        },this);
        
        return data;
    }, //eof prepareData
  
    /**
    * Returns the array of columns from a grid
    * @param {Ext.grid.Panel} grid The grid to get columns from
    * @return {Array} The array of grid columns
    */
    getColumns: function(grid) {
        var columns = [];
            
        return grid.headerCt.getVisibleGridColumns(true); //force cache refresh
    } //eof getColumns
});

//eo file