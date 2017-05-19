qx.Class.define("elpintao.comp.productos.pageHistoricoPrecio",
{
	extend : qx.ui.tabview.Page,
	construct : function (id_producto_item)
	{
	this.base(arguments);

	this.setLabel('Historico precio');
	this.setLayout(new qx.ui.layout.Grow());
	this.toggleShowCloseButton();
	

	var composite = new elpintao.comp.productos.compositeVisorHistoricoPrecio();
	this.add(composite);
	
		
	},
	members : 
	{

	}
});