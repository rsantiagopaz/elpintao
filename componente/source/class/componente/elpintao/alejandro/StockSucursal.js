qx.Class.define("componente.elpintao.alejandro.StockSucursal", {
extend: qx.ui.window.Window,
construct : function () {
	this.base(arguments);

	this.set({modal:false, layout:new qx.ui.layout.Basic(), showMaximize:false, allowMaximize:false, showMinimize:false, showClose:true, movable:true, resizable:false, showStatusbar:false});
	this.addListener("resize", this.center, this);
	this.setCaption("Stock de Sucursal");

	var application = qx.core.Init.getApplication();

	var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.alejandro.Maestros");
//	var sucursales = rpc.callSync("getSucursales", this._resActivacion);
	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};

	var fabricas = rpc.callSync("getFabricas");
	this._lstFabricas = new componente.general.alejandro.ow.List("Fabricas:", fabricas, true);
	this._lstFabricas.getCombo().setHeight(430);
	this._lstFabricas.getCombo().setSelectionMode("additive");

	var tbmGral = new qx.ui.table.model.Filtered();
	tbmGral.setColumns(
		["id_producto_item", "Fabrica", "Producto", "Cap", "Un", "Color", "Cantidad", "Costo Uni.", "Costo Total", "Litros", "suma"],
		["id_producto_item", "fabrica", "producto", "capacidad", "unidad", "color", "cantidad", "costo_unitario", "costo_total", "litros", "suma"]
	);
//			tbmGral.setColumns(
//				["id_producto_item", "Fabrica", "Producto", "Cap", "Un", "Color", "Cantidad", "Total", "Stock", "Rec. Dep.", "Ent.", "Sal.", "ok", "suma"],
//				["id_producto_item", "fabrica", "producto", "capacidad", "unidad", "color", "cantidad", "total", "stock", "rec_dep", "rec_ent", "rec_sal", "ok", "suma"]
//			);

	this._tblGral = new qx.ui.table.Table(tbmGral, custom);
	this._tblGral.setWidth(900);
	this._tblGral.setHeight(450);
	this._tblGral.setStatusBarVisible(false);
	this._tblGral.getTableColumnModel().setColumnVisible(0, false);
//			this._tblGral.getTableColumnModel().setColumnVisible(7, false);
//			this._tblGral.getTableColumnModel().setColumnVisible(8, false);
//			this._tblGral.getTableColumnModel().setColumnVisible(9, false);
	this._tblGral.getTableColumnModel().setColumnVisible(10, false);
//			this._tblGral.getTableColumnModel().setColumnVisible(11, false);
//			this._tblGral.getTableColumnModel().setColumnVisible(12, false);
//			this._tblGral.getTableColumnModel().setColumnVisible(13, false);

//			this._tblGral.getTableColumnModel().setDataCellRenderer(1, new qx.ui.table.cellrenderer.Default(null, null, null, null).set({defaultCellStyle:"font-weight: bold;"}));
//			this._tblGral.getTableColumnModel().setDataCellRenderer(5, new qx.ui.table.cellrenderer.Default(null, null, null, null).set({defaultCellStyle:"font-weight: bold;"}));

	var rbeGral = this._tblGral.getTableColumnModel().getBehavior();
	rbeGral.set(0, {width:30, minWidth:30});

	rbeGral.set(1, {width:"15%", minWidth:30});
	rbeGral.set(2, {width:"25%", minWidth:30});
	rbeGral.set(3, {width:"7%", minWidth:30});
	rbeGral.set(4, {width:"7%", minWidth:30});
	rbeGral.set(5, {width:"8%", minWidth:30});
	rbeGral.set(6, {width:"8%", minWidth:30});
	rbeGral.set(7, {width:"8%", minWidth:30});
	rbeGral.set(8, {width:"10%", minWidth:30});
	rbeGral.set(9, {width:"8%", minWidth:30});
	rbeGral.set(10, {width:"2%", minWidth:30});
//			rbeGral.set(11, {width:"7%", minWidth:30});
//			rbeGral.set(12, {width:30, minWidth:30});


//			var funCellRenderBaja = function (cellInfo) {
//				if (cellInfo.table.getTableModel().getValue(12, cellInfo.row) == "0") {
//					cellInfo.style += "; color: #000000; font-weight: bold;";
//				} else if ((cellInfo.table.getTableModel().getValue(12, cellInfo.row) > "0") && (cellInfo.table.getTableModel().getValue(12, cellInfo.row) < "12")) {
//					cellInfo.style += "; color: #A5982A; font-weight: bold;";
//				} else if (cellInfo.table.getTableModel().getValue(12, cellInfo.row) >= "11") {
//					cellInfo.style += "; color: #166D23; font-weight: bold;";
//				}
//				return new qx.ui.table.cellrenderer.Replace();
//			}
//			var CellRenderBaja = new qx.ui.table.cellrenderer.Dynamic(funCellRenderBaja);
//			this._tblGral.getTableColumnModel().setDataCellRenderer(7, CellRenderBaja);

	var menuCantidades = new qx.ui.menu.Menu();
	var cmdImprimirCantidades = new qx.ui.command.Command();
	var cmdAsignarStock = new qx.ui.command.Command();
	cmdImprimirCantidades.addListener("execute", function () {
		var win = componente.general.alejandro.ow.ow.getTableHTML(this._tblGral, this, {table:"border='1' cellspacing='0' cellpadding='0' width='100%' style='font-size:11;'"});
		win.open();
	}, this);

	var AsignarStockSeleccion = new qx.ui.menu.Button("Asignar Stock al Producto Seleccionado", "", cmdAsignarStock);
	var ImprimirCantidades = new qx.ui.menu.Button("Imprimir", "", cmdImprimirCantidades);
//			menuCantidades.add(AsignarStockSeleccion);
	menuCantidades.add(ImprimirCantidades);

	this._tblGral.setContextMenu(menuCantidades);

//	var chkSucursales = new qx.ui.form.ow.Checks("", sucursales, true);
//		chkSucursales.getLabel().setWidth(0);
////			chkSucursales.setValues([1, 3]);
//	chkSucursales.setValues([1, 2, 3, 4, 5, 7, 8, 9, 12, 11]);

	this._txtBuscar = new qx.ui.form.TextField();
		this._txtBuscar.setWidth(250);
	this._txtBuscar.setValue("");

	var txdDesde = new componente.general.alejandro.ow.DateText("Desde:");
	this._txdDesde = txdDesde;
		txdDesde.getLabel().setWidth(50);
		txdDesde.getDateText().setWidth(90);
	var txdHasta = new componente.general.alejandro.ow.DateText("Hasta:");
	this._txdHasta = txdHasta;
		txdHasta.getLabel().setWidth(50);
		txdHasta.getDateText().setWidth(90);
//	this._cmbSucursal = new qx.ui.form.ow.ComboBox("Sucursal:", sucursales);
//		this._cmbSucursal.getCombo().setWidth(80);
//		this._cmbSucursal.getLabel().setWidth(60);
	var btnAsignar = new qx.ui.form.Button("Asignar Stock");
	var btnVer = new qx.ui.form.Button("Traer Stock");
	var btnOcultarCeros = new qx.ui.form.Button("Ocultar Ceros");
	var btnTraerTotales = new qx.ui.form.Button("Traer Totales");
    var btnMuestreoStock = new qx.ui.form.Button("Muestreo de Stock");

    btnMuestreoStock.addListener("execute", function () {
        var win = new qx.ui.window.Window("Muestreo de Stock");
        win.set({showMaximize:false, allowMaximize:false, showMinimize:false, showClose:true, modal:true, movable:true, resizable:false, showStatusbar:false});
        win.setWidth(750);
        win.setHeight(500);
        win.setLayout(new qx.ui.layout.Dock());
        win.setAllowGrowX(false);
        this._iframe = new qx.ui.embed.ThemedIframe("reportes/muestreoStock.php");
        this._iframe.setMarginTop(5);
        win.add(this._iframe, {edge:"center"});
        win.open();
        win.center();
    }, this);

	var btnMarcasTodas = new qx.ui.form.ToggleButton("Marcar Todas las Fabricas");
	btnMarcasTodas.addListener("execute", function () {
		if (btnMarcasTodas.getValue()) {
			this._lstFabricas.getCombo().selectAll();
		} else {
			this._lstFabricas.getCombo().selectAll();
			this._lstFabricas.getCombo().invertSelection();
		}
		this.debug(btnMarcasTodas.getValue());
	}, this);

//			var test = new tokenfield.Token();
//			this.add(test, {left:410, top:30});

//			this.add(chkSucursales, {left:0, top:0});
	this.add(this._txtBuscar, {left:0, top:30});
//	this.add(this._cmbSucursal, {left:260, top:30});
//			this.add(this._txdDesde, {left:410, top:30});
//			this.add(this._txdHasta, {left:560, top:30});
//			this.add(btnAsignar, {left:600, top:30});
	this.add(btnVer, {left:500, top:30});
//			this.add(btnOcultarCeros, {left:600, top:30});
//			this.add(btnTraerTotales, {left:700, top:30});
    this.add(btnMuestreoStock, {left:910, top:0});
	this.add(btnMarcasTodas, {left:910, top:30});
	this.add(this._tblGral, {left:0, top:60});
	this.add(this._lstFabricas, {left:910, top:60});

	btnOcultarCeros.addListener("execute", function () {
		if (btnOcultarCeros.getLabel() == "Ocultar Ceros") {
			tbmGral.addNumericFilter("==", 0, "suma");
			tbmGral.applyFilters();
			btnOcultarCeros.setLabel("Mostrar Todos");
		} else {
			tbmGral.resetHiddenRows();
			btnOcultarCeros.setLabel("Ocultar Ceros");
		}

//				if (btnOcultarCeros.getValue()) {
//					tbmGral.addNumericFilter("==", 0, "cantidad");
//					tbmGral.addNumericFilter("==", 0, "total");
//					tbmGral.applyFilters();
//				} else {
//					tbmGral.resetHiddenRows();
//				}
	}, this);


	this._txtBuscar.addListener("keyup", function (e) {
		var texto = this._txtBuscar.getValue().trim();
		if (texto.length > 2) {
			var p = {};
			p.descrip = texto;

			var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.alejandro.Maestros");

			var app = this;
			rpc.callAsync(function (res, ex, id) {
				if (ex) {
					alert(ex);
				} else {
//							app._tblProductos.setFocusedCell();
					if (res) {
							app._tblGral.getTableModel().setDataAsMapArray(res, true);
//									app._tblProductos.setFocusedCell(1, 0, true);
					} else {
						app._tblGral.getTableModel().setDataAsMapArray([], true);
					}
				}
			}, "getProductos", p);
		} else {
			this._tblGral.getTableModel().setDataAsMapArray([], true);
		}
	}, this);

	btnVer.addListener("execute", function () {
//				this.debug(qx.lang.Json.stringify(this._lstFabricas.getCombo().getModelSelection().toArray().toString(), "", " "));
//				return true;
		for (var j=0; j<this._tblGral.getTableModel().getRowCount(); j++) {
				this._tblGral.getTableModel().setValue(6, j, 0);
				this._tblGral.getTableModel().setValue(7, j, 0);
//						this._tblGral.getTableModel().setValue(12, j, 0);
//						this._tblGral.getTableModel().setValue(13, j, (parseInt(this._tblGral.getTableModel().getValue(7, j)) + parseInt(this._tblGral.getTableModel().getValue(6, j))));
		}

		var p = {};
//		p.sucs = new Array();
//		p.sucs.push(this._cmbSucursal.getValue());

//		var rpcSuc = new componente.general.ramon.io.rpc.Rpc("services/", "elpintao.Maestros");
//		var suc = rpcSuc.callSync("getUbicacionesSuc", p);

		var modo = this._modo;
		var p = {};
//		p.id_sucursal = suc[0]["id_sucursal"];
		p.descrip = this._txtBuscar.getValue().trim();
		p.desde = this._txdDesde.getValueToSQL();
		p.hasta = this._txdHasta.getValueToSQL();
//		p.url = suc[0][modo + "url"];
//		p.username = suc[0][modo + "username"];
//		p.password = suc[0][modo + "password"];
//		p.base = suc[0][modo + "base"];
		p.modo = modo;
		p.fabricas = this._lstFabricas.getCombo().getModelSelection().toArray().toString();

		var app = this;
//		var rpcDiaria = new componente.general.ramon.io.rpc.Rpc("http://" + suc[0][modo + "username"] + ":" + suc[0][modo + "password"] + "@" + suc[0][modo + "url"] + "/remote/services/", "elpintao.Ventas");
		var rpcDiaria = new componente.general.ramon.io.rpc.Rpc("services/", "comp.alejandro.Maestros");
		rpcDiaria.setCrossDomain(true);
		//rpcDiaria.setTimeout(10000);
		var total_cantidad = 0;
		var total_rec_dep = 0;
		var total_rec_ent = 0;
		var total_rec_sal = 0;

		var total_cantidad_l = 0;
		var total_rec_dep_l = 0;
		var total_rec_ent_l = 0;
		var total_rec_sal_l = 0;

		var ban_totales = true;


		rpcDiaria.callAsync(function (res, ex, id) {
			if (!ex) {
				if (res) {
					if (app._txtBuscar.getValue().trim() != "") {
//								app.debug("THEN");
						for (var i=0; i<res.length; i++) {
							for (var j=0; j<app._tblGral.getTableModel().getRowCount(); j++) {
								if (parseInt(res[i].id_producto_item) == parseInt(app._tblGral.getTableModel().getValue(0, j))) {
	//								app.debug("Ok j: " + j + " - " + res[i].id_producto_item);
									app._tblGral.getTableModel().setValue(6, j, parseInt(res[i].cantidad));
									app._tblGral.getTableModel().setValue(9, j, parseInt(res[i].rec_dep));
//											app._tblGral.getTableModel().setValue(10, j, parseInt(res[i].rec_ent));
//											app._tblGral.getTableModel().setValue(11, j, parseInt(res[i].rec_sal));
//											total_cantidad += parseInt(res[i].cantidad);
//											total_rec_dep += parseInt(res[i].rec_dep);
//											total_rec_ent += parseInt(res[i].rec_ent);
//											total_rec_sal += parseInt(res[i].rec_sal);
									total_cantidad += parseFloat(parseInt(res[i].cantidad)*res[i].costo);
									total_rec_dep += parseFloat(parseInt(res[i].rec_dep)*res[i].costo);
									total_rec_ent += parseFloat(parseInt(res[i].rec_ent)*res[i].costo);
									total_rec_sal += parseFloat(parseInt(res[i].rec_sal)*res[i].costo);

									switch (app._tblGral.getTableModel().getValue(4, j)) {
										case "lts":
										case "cc":
										case "ml":
											total_cantidad_l += parseFloat(res[i].cantidad*parseFloat(app._tblGral.getTableModel().getValue(3, j)));
											total_rec_dep_l += parseFloat(res[i].rec_dep*parseFloat(app._tblGral.getTableModel().getValue(3, j)));
											total_rec_ent_l += parseFloat(res[i].rec_ent*parseFloat(app._tblGral.getTableModel().getValue(3, j)));
											total_rec_sal_l += parseFloat(res[i].rec_sal*parseFloat(app._tblGral.getTableModel().getValue(3, j)));
										break;
										case "un":
											var multiplicador = 0;
										break;
										case "kgs":
											var multiplicador = 0;
										break;
										case "gr":
											var multiplicador = 0;
										break;
										case "mt":
											var multiplicador = 0;
										break;
										case "CM":
											var multiplicador = 0;
										break;
										case "mm":
											var multiplicador = 0;
										break;
										case "CM3":
											var multiplicador = 0;
										break;
										case "mts":
											var multiplicador = 0;
										break;
									}
								} else {
	//								app.debug(res[i].id_producto_item + " --- " + app._tblGral.getTableModel().getValue(0, j));
								}
							}
						}
					} else {
						app.debug("ELSE");
						app._tblGral.getTableModel().setDataAsMapArray(res, true, true);
						for (var i=0; i<res.length; i++) {
							total_cantidad += parseFloat(res[i].cantidad*res[i].costo);
							total_rec_dep += parseFloat(res[i].rec_dep*res[i].costo);
							total_rec_ent += parseFloat(res[i].rec_ent*res[i].costo);
							total_rec_sal += parseFloat(res[i].rec_sal*res[i].costo);

							switch (res[i].unidad) {
								case "lts":
									total_cantidad_l += parseFloat(res[i].cantidad*res[i].capacidad);
									total_rec_dep_l += parseFloat(res[i].rec_dep*res[i].capacidad);
									total_rec_ent_l += parseFloat(res[i].rec_ent*res[i].capacidad);
									total_rec_sal_l += parseFloat(res[i].rec_sal*res[i].capacidad);
								break;
								case "c.c.":
									total_cantidad_l += parseFloat(res[i].cantidad*(res[i].capacidad/100));
									total_rec_dep_l += parseFloat(res[i].rec_dep*(res[i].capacidad/100));
									total_rec_ent_l += parseFloat(res[i].rec_ent*(res[i].capacidad/100));
									total_rec_sal_l += parseFloat(res[i].rec_sal*(res[i].capacidad/100));
								break;
								case "ml":
									total_cantidad_l += parseFloat(res[i].cantidad*(res[i].capacidad/1000));
									total_rec_dep_l += parseFloat(res[i].rec_dep*(res[i].capacidad/1000));
									total_rec_ent_l += parseFloat(res[i].rec_ent*(res[i].capacidad/1000));
									total_rec_sal_l += parseFloat(res[i].rec_sal*(res[i].capacidad/1000));
								break;
								case "un":
									var multiplicador = 0;
								break;
								case "kgs":
									var multiplicador = 0;
								break;
								case "gr":
									var multiplicador = 0;
								break;
								case "mt":
									var multiplicador = 0;
								break;
								case "CM":
									var multiplicador = 0;
								break;
								case "mm":
									var multiplicador = 0;
								break;
								case "CM3":
									var multiplicador = 0;
								break;
								case "mts":
									var multiplicador = 0;
								break;
							}
						}
					}
				} else {
				}
				app._tblGral.getTableModel().resetHiddenRows();
				var total_rows = app._tblGral.getTableModel().getRowCount();
				for (var x=0; x<total_rows; x++) {
					if (app._tblGral.getTableModel().getValue(0, x) == "") {
						app._tblGral.getTableModel().removeRows(x, 1);
					}
				}
			}

			for (var j=0; j<app._tblGral.getTableModel().getRowCount(); j++) {
			}
		}, "getCantidadesStock", p);

	}, this);
},
members : {

}
});
