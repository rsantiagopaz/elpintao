qx.Class.define("componente.elpintao.ramon.productos.windowAplicarAjustes",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function (id_arbol)
	{
		this.base(arguments);
		
		this.set({
			caption: "Aplicar ajustes",
			width: 375,
			height: 200,
			showMinimize: false,
			showMaximize: false
		});
		
		this.setLayout(new qx.ui.layout.Basic());
		this.setResizable(false, false, false, false);
		
	this.addListenerOnce("appear", function(e){
		slbAplicar.focus();
	});
	
	componente.elpintao.ramon.Rutinas.crear_obj_base(["objFabrica"]);
	
	var application = qx.core.Init.getApplication();
	var numberformatMontoEng = new qx.util.format.NumberFormat("en");
	numberformatMontoEng.setGroupingUsed(false);
	numberformatMontoEng.setMaximumFractionDigits(2);
	numberformatMontoEng.setMinimumFractionDigits(2);
	
	
	var slbAplicar = new qx.ui.form.SelectBox();
	slbAplicar.setInvalidMessage("Debe seleccionar operación");
	slbAplicar.add(new qx.ui.form.ListItem("Precio lista:", null, "precio_lista"));
	slbAplicar.add(new qx.ui.form.ListItem("Remarc.CF.:", null, "remarc_final"));
	slbAplicar.add(new qx.ui.form.ListItem("Desc.CF.:", null, "desc_final"));
	slbAplicar.add(new qx.ui.form.ListItem("Bonif.CF.:", null, "bonif_final"));
	slbAplicar.add(new qx.ui.form.ListItem("Remarc.may.:", null, "remarc_mayorista"));
	slbAplicar.add(new qx.ui.form.ListItem("Desc.may.:", null, "desc_mayorista"));
	slbAplicar.add(new qx.ui.form.ListItem("Bonif.may.:", null, "bonif_mayorista"));
	slbAplicar.add(new qx.ui.form.ListItem("Comisión:", null, "comision_vendedor"));
	slbAplicar.add(new qx.ui.form.ListItem("- - - - - - - - - - -", null, false));
	slbAplicar.add(new qx.ui.form.ListItem("Precio CF.:", null, "pcfcd"));
	this.add(slbAplicar, {left: 15, top: 0});

	var txtPorcentaje = new qx.ui.form.Spinner(-1000, 0, 1000);
	txtPorcentaje.setWidth(70);
	txtPorcentaje.setNumberFormat(numberformatMontoEng);
	txtPorcentaje.getChildControl("upbutton").setVisibility("excluded");
	txtPorcentaje.getChildControl("downbutton").setVisibility("excluded");
	txtPorcentaje.setSingleStep(0);
	txtPorcentaje.setPageStep(0);
	txtPorcentaje.setInvalidMessage("Debe ingresar porcentaje distinto de 0");

	this.add(txtPorcentaje, {left: 145, top: 0});	
	this.add(new qx.ui.basic.Label("%"), {left: 0, top: 5});
	
	var chkFabrica = new qx.ui.form.CheckBox("Aplicar solo a fábrica");
	this.add(chkFabrica, {left: 0, top: 40});
	
	var slbFabrica = new qx.ui.form.VirtualSelectBox();
	slbFabrica.setWidth(200);
	slbFabrica.setLabelPath("descrip");
	slbFabrica.setModel(application.objFabrica.store.getModel());
	this.add(slbFabrica, {left: 145, top: 35});
	
	chkFabrica.bind("value", slbFabrica, "enabled");

		

	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.addListener("execute", function(e){
		var p = {};
		p.aplicar = slbAplicar.getModelSelection().getItem(0);
		p.porcentaje = txtPorcentaje.getValue();
		slbAplicar.setValid((p.aplicar != false));
		txtPorcentaje.setValid((p.porcentaje > 0 || p.porcentaje < 0));

		if (slbAplicar.getValid() && txtPorcentaje.getValid()) {
			btnAceptar.setEnabled(false);
			btnCancelar.setEnabled(false);
			
			var bounds = application.getRoot().getBounds();
			var imageLoading = new qx.ui.basic.Image("elpintao/loading66.gif");
			imageLoading.setBackgroundColor("#FFFFFF");
			imageLoading.setDecorator("main");
			application.getRoot().add(imageLoading, {left: parseInt(bounds.width / 2 - 33), top: parseInt(bounds.height / 2 - 33)});
			
			p.id_arbol = id_arbol;
			p.id_fabrica = (chkFabrica.getValue() ? slbFabrica.getSelection().getItem(0).get("id_fabrica") : null);
			
			//alert(qx.lang.Json.stringify(p, null, 2));
			//return;
			
			var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Productos");
			rpc.setTimeout(1000 * 60);
			rpc.callAsync(qx.lang.Function.bind(function(resultado, error, id){
				imageLoading.destroy();
				this.fireDataEvent("aceptado", resultado);
				this.destroy();
			}, this), "aplicar_porcentaje", p);
		

		} else {
			if (! txtPorcentaje.getValid()) txtPorcentaje.focus();
			if (! slbAplicar.getValid()) slbAplicar.focus();
		}
	}, this);
	this.add(btnAceptar, {left: 80, top: 120})
	
	var btnCancelar = new qx.ui.form.Button("Cancelar");
	btnCancelar.addListener("execute", function(e){
		this.destroy();
	}, this);
	this.add(btnCancelar, {left: 205, top: 120})

	
	slbAplicar.setTabIndex(1);
	txtPorcentaje.setTabIndex(2);
	chkFabrica.setTabIndex(3);
	slbFabrica.setTabIndex(4);
	btnAceptar.setTabIndex(5);
	btnCancelar.setTabIndex(6);
		
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});