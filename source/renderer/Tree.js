/**
 * Helper class to easily print the contents of a tree. Will open a new window with a table where the first row
 * contains the headings from your column model, and with a row for each item in your store. When formatted
 * with appropriate CSS it should look very similar to a default tree. If renderers are specified in your column
 * model, they will be used in creating the table. Override headerTpl and bodyTpl to change how the markup is generated.
 * 
 * @class Ext.ux.printer.renderer.Tree
 * @extends Ext.ux.printer.renderer.Base
 * @author pscrawford
 * @constructor
 * @param {Object} config
 */
Ext.define('Ext.ux.printer.renderer.Tree', {
    extend: 'Ext.ux.printer.renderer.Base',
    
    /**
    * @property bodyTpl
    * @type Ext.XTemplate
    * The XTemplate used to create each row. This is used inside the 'print' function to build another XTemplate, to which the data
    * are then applied (see the escaped dataIndex attribute here - this ends up as "{dataIndex}")
    * Since we want "indent" to apply to the subtemplate, we must double wrap with braces \{\} then process the key as code {[]}.
    */
    bodyTpl: [
        '<tr>',
            '<tpl for=".">',
                '<tpl if="dataIndex">',
                    '<td>',
                        '\{{["indent"]}\}',
                        '\{{dataIndex}\}',
                    '</td>',
                '</tpl>',
            '</tpl>',
        '</tr>'
    ],  
  
    /**
     * @property depthIncrement
     * @type String
     */
    incrementText: '&nbsp;&nbsp;&nbsp;&nbsp;',
    
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
     */
    rowBodySelector: '.x-grid-rowbody',
    
    /**
    * Generates the body HTML for the tree
    * @param {Ext.tree.Panel} tree The tree to print
    */
    generateBody: function(tree) {
        var columns = this.getColumns(tree),
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
    * Prepares data from the tree for use in the XTemplate
    * @param {Ext.tree.Panel} tree The tree panel
    * @return {Array} Data suitable for use in the XTemplate
    */
    prepareData: function(tree) {
        //We generate an XTemplate here by using 2 intermediary XTemplates - one to create the header,
        //the other to create the body (see the escaped {} below)
        var columns = this.getColumns(tree),
            //build a useable array of store data for the XTemplate
            data = [],
            ds = tree.store,
            root = ds.getRootNode(),
            view = tree.getView(),
            rowIdx = 0,
            iText = this.incrementText,
            indent = '',
            i = 0,
            rb;
            
        /**
         * @private
         * @param {Ext.data.NodeInterface} node
         */
        function eachNode(node){
            var convertedData = {},
                expanded = node.isExpanded();
            
            //bug with ExtJS - root node is visible even when rootVisible is false
            if ((!node.isRoot() && node.isVisible()) || (node.isRoot() && node.isVisible() && tree.rootVisible)){
                //apply renderers from column model
                Ext.iterate(node.data, function(key, value) {
                    Ext.each(columns, function(column,colIdx) {
                        if (column.dataIndex == key) {
                            convertedData[key] = column.renderer ? column.renderer.call(column.scope || this, value, {}, node, rowIdx, colIdx, ds, view) : value;
                            return false;
                        }
                    }, this);
                });
                
                indent = '';
                for(i = 0; i < node.getDepth(); i++){
                    indent += iText;
                }
                indent += !node.isLeaf() ? (expanded ? '-' : '+') : '&nbsp;&nbsp;';
                convertedData['indent'] = indent;
                data.push(convertedData);
            }
            
            rowIdx++;
            
            if (expanded){
                node.eachChild(eachNode,this);
            }
        };
        eachNode.call(this,root);
        
        return data;
    }, //eof prepareData
  
    /**
    * Returns the array of columns from a tree
    * @param {Ext.tree.Panel} tree The tree to get columns from
    * @return {Array} The array of tree columns
    */
    getColumns: function(tree) {
        var columns = [];
            
        return tree.headerCt.getVisibleGridColumns(true); //force cache refresh
    } //eof getColumns
  
//}, function(){
//    Ext.ux.printer.Manager.registerRenderer('TreePanel', Ext.ux.printer.TreePanelRenderer);
});

//eo file