qx.Class.define("componente.elpintao.ramon.productos.compositeProductos",
{
	extend : qx.ui.container.Composite,
	construct : function (usuario)
	{
	this.base(arguments);

	this.setLayout(new qx.ui.layout.Grow());
	
	this.addListenerOnce("appear", function(e){
		/*
		var aux = slbFabrica.getChildren();
		for (var i in aux) {
			if (aux[i].getModel().get("id_fabrica")=="1") {
				slbFabrica.setSelection([aux[i]]);
				break;
			}
		}
		*/
		
		tree.focus();
	}, this);
	

	qx.Mixin.define("my.Mixin",
	{
	  properties: {
	    parentNode: {init: null, nullable: true, event: "parentNode"}
	  }
	});
	
	
	var application = qx.core.Init.getApplication();
	var contexto = this;
	var bandera_cod_barra = false;
	var numberformatMontoEs = new qx.util.format.NumberFormat("es").set({groupingUsed: false, maximumFractionDigits: 2, minimumFractionDigits: 2});
	var nodoActual;
	var nodoPadre;
	var bandera_id_producto="0";
	var cortado = null;
	var arrayNodes = [];
	
	

	var functionLeer_producto = function(p) {
		
		p.id_usuario = usuario.id_usuario;
		
		var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Productos");
		rpc.setTimeout(1000 * 60);
		rpc.callAsync(function(resultado, error, id){
			for (var x in resultado.producto_item) {
				componente.elpintao.Rutinas.calcularImportes(resultado.producto_item[x]);
			}

			if (bandera_id_producto!="0") {
				tbl.blur();
				tbl2.blur();
			}
			
			tableModel.setDataAsMapArray(resultado.producto_item, true, false);
			if (tableModel.getSortMethods(0)) tableModel.sortByColumn(0, true);

			tableModel2.setDataAsMapArray(resultado.producto, true, false);
			
			if (resultado.producto_item.length > 0 && bandera_id_producto!="0") {
				tbl.buscar("id_producto", bandera_id_producto);
			} else tbl.setFocusedCell();
			
			if (resultado.producto.length > 0 && bandera_id_producto!="0") {
				tbl2.buscar("id_producto", bandera_id_producto);
			} else tbl2.setFocusedCell();
			
			if (bandera_id_producto!="0") {
				if (tgbSoloProducto.getValue()) tbl2.focus(); else tbl.focus();
			}
			bandera_id_producto="0";

		}, "leer_producto", p);
	}
	
	var functionPrepare = function(nodo, parent) {
		var resultado = [nodo];
		nodo.set("parentNode", parent);
		arrayNodes[nodo.get("id_arbol")] = nodo;
		
		if (parent != null) {
			nodo.set("clasificacion", parent.get("clasificacion") + " / " + nodo.get("descrip"));
		}
		
		var hijos = nodo.get("hijos");
		var length = hijos.getLength();
		for (var x=0; x < length; x++) {
			resultado = resultado.concat(functionPrepare(hijos.getItem(x), nodo));
		}
		
		return resultado;
	}
	
	var functionMoverNodo = function(nodo, nodoActual) {
		var resultado = true;
		if (nodo == nodoActual) {
			resultado = false;
		} else {
			var hijos = nodo.get("hijos");
			var length = hijos.getLength();
			for (var x=0; x < length; x++) {
				resultado = functionMoverNodo(hijos.getItem(x), nodoActual);
				if (!resultado) break;
			}
		}
		
		return resultado;
	}
	
	
	
	

	var splitpane = new qx.ui.splitpane.Pane("horizontal");
	splitpane.setDecorator(null);
	this.add(splitpane);
	

	
	
	var delegateMarshal = {
		getModelMixins: function(properties) {
			return my.Mixin;
		}
	}
	
	var marshal = new qx.data.marshal.Json(delegateMarshal);
	
	
	
	
	
	var commandAgregarNodo = new qx.ui.command.Command("Insert");
	commandAgregarNodo.addListener("execute", function(e){
		tree.openNode(nodoActual);
		var id_padre = nodoActual.get("id_arbol");
		
		var p = {};
		p.id_padre = id_padre;
		var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Productos");
		try {
			var resultado = rpc.callSync("agregar_nodo", p);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
		
		nodoActual.set("cant_hijos", nodoActual.get("cant_hijos") + 1);
		var nodo = {id_arbol: resultado, id_padre: id_padre, descrip: "Nuevo nodo", cant_hijos: 0, cant_productos: 0, clasificacion: "", vtitem: null, hijos: []};
		nodo = marshal.toModel(nodo);
		arrayNodes[nodo.get("id_arbol")] = nodo;
		nodo.set("parentNode", nodoActual);
		nodoActual.get("hijos").push(nodo);
		tree.getSelection().setItem(0, nodo);

		qx.event.Timer.once(function(){
			commandEditarNodo.fireDataEvent("execute");
		}, this, 100);
	});
	
	var commandEditarNodo = new qx.ui.command.Command("F2");
	commandEditarNodo.setEnabled(false);
	commandEditarNodo.addListener("execute", function(e){
		var vtitem = nodoActual.get("vtitem");
		
		var cal = (vtitem.getLevel() + 2) * vtitem.getIndent() + 9;
		var popup = new qx.ui.popup.Popup(new qx.ui.layout.Canvas()).set({
			offsetLeft : cal,
        	offsetTop : -25
		});
		popup.addListenerOnce("appear", function(e){
			txtNodo.focus();
		});
		popup.addListenerOnce("disappear", function(e){
			popup.destroy();
		});

		var txtNodo = new qx.ui.form.TextField();
		txtNodo.addListener("keypress", function(e){
			if (e.getKeyIdentifier() == "Escape") {
				popup.hide();
				tree.focus();
			} else if (e.getKeyIdentifier() == "Enter") {
				var descrip = txtNodo.getValue().trim();
				if (descrip=="") {
					popup.hide();
					tree.focus();
				} else {
					nodoActual.set("descrip", descrip);
					var clasificacion = functionPrepare(nodoActual, nodoActual.get("parentNode"));
					for (var x in clasificacion) {
						clasificacion[x] = {id_arbol: clasificacion[x].get("id_arbol"), clasificacion: clasificacion[x].get("clasificacion")};
					}
					
					var p = {};
					p.id_arbol = nodoActual.get("id_arbol");
					p.descrip = descrip;
					p.clasificacion = clasificacion;
					var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Productos");
					try {
						var resultado = rpc.callSync("modificar_nodo", p);
					} catch (ex) {
						alert("Sync exception: " + ex);
					}
					
					popup.hide();
					tree.focus();
				}
			}
		});
		txtNodo.setWidth(vtitem.getBounds().width - cal);
		txtNodo.setValue(nodoActual.get("descrip"));
		txtNodo.selectAllText();
		txtNodo.setPaddingLeft(1);
		popup.add(txtNodo);
        popup.placeToWidget(vtitem, true);
        popup.show();
	});
	
	var menuTree = new componente.general.ramon.ui.menu.Menu();
	//var btnAgregarNodo = new qx.ui.menu.Button("Agregar nodo", null, commandAgregarNodo);
	var btnAgregarNodo = new qx.ui.menu.Button("Agregar nodo");
	btnAgregarNodo.addListener("execute", function(e){
		tree.openNode(nodoActual);
		var id_padre = nodoActual.get("id_arbol");
		
		var p = {};
		p.id_padre = id_padre;
		var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Productos");
		try {
			var resultado = rpc.callSync("agregar_nodo", p);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
		
		nodoActual.set("cant_hijos", nodoActual.get("cant_hijos") + 1);
		var nodo = {id_arbol: resultado, id_padre: id_padre, descrip: "Nuevo nodo", cant_hijos: 0, cant_productos: 0, clasificacion: "", vtitem: null, hijos: []};
		nodo = marshal.toModel(nodo);
		arrayNodes[nodo.get("id_arbol")] = nodo;
		nodo.set("parentNode", nodoActual);
		nodoActual.get("hijos").push(nodo);
		tree.getSelection().setItem(0, nodo);

		qx.event.Timer.once(function(){
			commandEditarNodo.fireDataEvent("execute");
		}, this, 100);
	}, this);
	var btnEditarNodo = new qx.ui.menu.Button("Editar", null, commandEditarNodo);
	var btnEliminarNodo = new qx.ui.menu.Button("Eliminar nodo");
	btnEliminarNodo.setEnabled(false);
	btnEliminarNodo.addListener("execute", function(e){
		dialog.Dialog.confirm("Desea eliminar el nodo seleccionado?", function(e){
			if (e) {
				var nodoActualLocal = nodoActual;
				var nodoPadreLocal = nodoPadre;
				
				var p = {};
				p.id_arbol = nodoActual.get("id_arbol");
				p.id_padre = nodoActual.get("id_padre");
				var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Productos");
				try {
					var resultado = rpc.callSync("eliminar_nodo", p);
				} catch (ex) {
					alert("Sync exception: " + ex);
				}
		
				nodoPadreLocal.set("cant_hijos", nodoPadreLocal.get("cant_hijos") - 1);
				tree.getSelection().setItem(0, nodoPadreLocal);
				nodoPadreLocal.get("hijos").remove(nodoActualLocal);
				if (cortado != null && cortado.nodo==nodoActualLocal) {
					cortado = null;
					btnPegar.setEnabled(false);
					menuTree.memorizar([btnPegar]);
				}
			}
			tree.focus();
		});
	});
	
	var btnNuevoProducto = new qx.ui.menu.Button("Alta producto...");
	btnNuevoProducto.addListener("execute", function(){
		var win = new componente.elpintao.ramon.productos.windowProducto(nodoActual.get("id_arbol"), "0", nodoActual.get("clasificacion"));
		win.addListener("aceptado", function(e){
			bandera_id_producto = e.getData();
			nodoActual.set("cant_productos", nodoActual.get("cant_productos") + 1);
			tree.getSelection().fireDataEvent("change");
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	
	var btnCortarNodo = new qx.ui.menu.Button("Cortar");
	btnCortarNodo.addListener("execute", function(e){
		cortado = {origen: "arbol", nodo: nodoActual};
		btnPegar.setEnabled(true);
		menuTree.memorizar([btnPegar]);
	});
	
	var btnPegar = new qx.ui.menu.Button("Pegar");
	btnPegar.setEnabled(false);
	btnPegar.addListener("execute", function(e){
		if (cortado.origen == "arbol") {
			if (functionMoverNodo(cortado.nodo, nodoActual)) {
				var parentNode = cortado.nodo.get("parentNode");
				parentNode.get("hijos").remove(cortado.nodo);
				parentNode.set("cant_hijos", parentNode.get("cant_hijos") - 1);
				tree.openNode(nodoActual);
				cortado.nodo.set("parentNode", nodoActual);
				nodoActual.get("hijos").push(cortado.nodo);
				nodoActual.set("cant_hijos", nodoActual.get("cant_hijos") + 1);
				
				var clasificacion = functionPrepare(cortado.nodo, nodoActual);
				for (var x in clasificacion) {
					clasificacion[x] = {id_arbol: clasificacion[x].get("id_arbol"), clasificacion: clasificacion[x].get("clasificacion")};
				}
				
				//alert(qx.lang.Json.stringify(clasificacion, null, 2));
				
				var p = {};
				p.id_arbol = cortado.nodo.get("id_arbol");
				p.id_padre = nodoActual.get("id_arbol");
				p.id_padre_original = parentNode.get("id_arbol");
				p.clasificacion = clasificacion;
				
				var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Productos");
				try {
					var resultado = rpc.callSync("mover_nodo", p);
				} catch (ex) {
					alert("Sync exception: " + ex);
				}
				
				btnEliminarNodo.setEnabled(nodoActual.get("id_arbol") != "1" && nodoActual.get("cant_hijos")==0 && nodoActual.get("cant_productos")==0);
				menuTree.memorizar([btnEliminarNodo]);
			}
		} else {
			if (cortado.row.id_arbol != nodoActual.get("id_arbol")) {
				arrayNodes[cortado.row.id_arbol].set("cant_productos", arrayNodes[cortado.row.id_arbol].get("cant_productos") - 1);
				nodoActual.set("cant_productos", nodoActual.get("cant_productos") + 1)
				
				var p = {};
				p.id_producto = cortado.row.id_producto;
				p.id_arbol_actual = cortado.row.id_arbol;
				p.id_arbol = nodoActual.get("id_arbol");
				p.clasificacion = nodoActual.get("clasificacion");
				
				//alert(qx.lang.Json.stringify(p, null, 2));
				
				var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Productos");
				try {
					var resultado = rpc.callSync("mover_productos", p);
				} catch (ex) {
					alert("Sync exception: " + ex);
				}
				
				if (this.banderaModoBuscar) {
					txtBuscar.fireDataEvent("changeValue");
				} else {
					bandera_id_producto = cortado.row.id_producto;
					tree.getSelection().fireDataEvent("change");
				}
			}
		}
		
		cortado = null;
		btnPegar.setEnabled(false);
		menuTree.memorizar([btnPegar]);
	}, this);
	
	var btnAplicar = new qx.ui.menu.Button("Aplicar ajustes...");
	btnAplicar.addListener("execute", function(e){
		var win = new componente.elpintao.ramon.productos.windowAplicarAjustes(nodoActual.get("id_arbol"));
		win.addListener("aceptado", function(e){
			this.actualizar();
			/*
			if (this.banderaModoBuscar) {
				slbFabrica.fireEvent("changeSelection");
			} else {
				tree.getSelection().fireDataEvent("change");
			}
			*/
		}, this);
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	}, this);
	
	menuTree.add(btnAgregarNodo);
	menuTree.add(btnEditarNodo);
	menuTree.add(btnEliminarNodo);
	menuTree.addSeparator();
	menuTree.add(btnNuevoProducto);
	menuTree.addSeparator();
	menuTree.add(btnCortarNodo);
	menuTree.add(btnPegar);
	menuTree.addSeparator();
	menuTree.add(btnAplicar);
	menuTree.memorizar();
	commandAgregarNodo.setEnabled(false);
	
	
	
	
	var delegateTree = {
		bindItem: function(controller, item, id) {
			controller.bindDefaultProperties(item, id);
			item.getModel().set("vtitem", item);
		}
	}
	

	var tree = this.tree = new componente.general.ramon.ui.tree.VirtualTree(null, "descrip", "hijos");
	tree.setDelegate(delegateTree);
	//tree.setShowTopLevelOpenCloseIcons(false);
	
	tree.addListener("close", function(e) {
		var data = e.getData();
		if (data == tree.getModel()) tree.openNode(data);
	});
	
	tree.getSelection().addListener("change", function(e) {
		nodoActual = tree.getSelection().getItem(0);
		nodoPadre = nodoActual.get("parentNode");
		
		var boolRaiz = (nodoActual == tree.getModel());
		
		//commandAgregarNodo.setEnabled(true);
		btnAgregarNodo.setEnabled(true);
		commandEditarNodo.setEnabled(!boolRaiz);
		btnEliminarNodo.setEnabled(!boolRaiz && nodoActual.get("cant_hijos")==0 && nodoActual.get("cant_productos")==0);
		btnCortarNodo.setEnabled(!boolRaiz);
		btnAplicar.setEnabled(true);
		//menuTree.memorizar([commandAgregarNodo, commandEditarNodo, btnEliminarNodo, btnCortarNodo, btnAplicar]);
		menuTree.memorizar([btnAgregarNodo, commandEditarNodo, btnEliminarNodo, btnCortarNodo, btnAplicar]);
		
		if (!this.banderaModoBuscar) {
			nodoActual = tree.getSelection().getItem(0);
			nodoPadre = nodoActual.get("parentNode");
			tbl.setFocusedCell();
			tableModel.setDataAsMapArray([], true, false);
			
			var p = {};
			p.id_arbol = nodoActual.get("id_arbol");
			
			functionLeer_producto(p);
		}
	}, this);
	
	
	tree.setContextMenu(menuTree);

	
	
	
	var slbFabrica = this.slbFabrica = new componente.general.ramon.ui.selectbox.SelectBox();
	var controllerFabrica = new qx.data.controller.List(null, slbFabrica, "descrip");
	application.objFabrica.store.bind("model", controllerFabrica, "model");
	
	var aux = slbFabrica.getChildren();
	for (var i in aux) {
		if (aux[i].getModel().get("id_fabrica")=="1") {
			slbFabrica.setSelection([aux[i]]);
			break;
		}
	}
	
	slbFabrica.addListener("changeSelection", function(e){
		var model = slbFabrica.getModelSelection().getItem(0);
		var texto = txtBuscar.getValue().trim();
		
		if (model.get("id_fabrica")=="1" && texto=="") {
			this.banderaModoBuscar = false;
			tree.getSelection().fireDataEvent("change");
		} else if (model.get("id_fabrica")!="1" || texto.length >= 3) {
			this.banderaModoBuscar = true;
			var p = {};
			
			p.descrip = ((model.get("id_fabrica")!="1") ? model.get("descrip") + " " : "") + ((texto.length >= 3) ? texto : "");
			
			p.usuario = {id_arbol: usuario.id_arbol};
			
			functionLeer_producto(p);
		}
	}, this);
	
	
	
	
	
	var tgbSoloProducto = new qx.ui.form.ToggleButton("Solo fab./prod.");
	tgbSoloProducto.addListener("changeValue", function(e){
		var value = e.getData();
		tbl.setVisibility((value) ? "hidden" : "visible");
		tbl2.setVisibility((! value) ? "hidden" : "visible");
		
		if (value) tbl2.focus(); else tbl.focus();
	});
	
	
	
	
	var txtBuscar = new qx.ui.form.TextField("");
	txtBuscar.setLiveUpdate(true);
	
	txtBuscar.addListener("keypress", function(e){
		var keyIdentifier = e.getKeyIdentifier();
		if (keyIdentifier == "Enter") {
			bandera_cod_barra = true;
			txtBuscar.fireDataEvent("changeValue");
		} else if (keyIdentifier == "Down") {
			if (tbl.getFocusedRow()==null && tableModel.getRowCount() > 0) {
				if (tgbSoloProducto.getValue()) {
					tbl2.setFocusedCell(0, 0, true);
					tbl2.focus();
				} else {
					tbl.setFocusedCell(0, 0, true);
					tbl.focus();
				}
			}
		}
	});
	txtBuscar.addListener("changeValue", function(e){
		var model = slbFabrica.getModelSelection().getItem(0);
		var texto = txtBuscar.getValue().trim();
		
		if (model.get("id_fabrica")=="1" && texto=="") {
			this.banderaModoBuscar = false;
			tree.getSelection().fireDataEvent("change");
		} else if (model.get("id_fabrica")!="1" || texto.length >= 3) {
			this.banderaModoBuscar = true;
			var p = {};
			
			if (bandera_cod_barra) {
				p.cod_barra = texto;
			} else {
				p.descrip = ((model.get("id_fabrica")!="1") ? model.get("descrip") + " " : "") + ((texto.length >= 3) ? texto : "");
			}
			
			p.usuario = {id_arbol: usuario.id_arbol};
			functionLeer_producto(p);
		}
		bandera_cod_barra = false;
	}, this);

	
	
	
	
	
	
	
	
	
	
	//Menu de contexto
	
	var commandEditarPrecios = new qx.ui.command.Command("Enter");
	commandEditarPrecios.setEnabled(false);
	commandEditarPrecios.addListener("execute", function(e) {
		var id_producto = tableModel.getRowData(tbl.getFocusedRow()).id_producto;
		var win = new componente.elpintao.ramon.productos.windowPrecios(nodoActual.get("id_arbol"), id_producto, nodoActual.get("clasificacion"));
		win.addListener("aceptado", function(e){
			bandera_id_producto = id_producto;
			
			this.actualizar();
			
			/*
			if (this.banderaModoBuscar) {
				txtBuscar.fireDataEvent("changeValue");
			} else {
				tree.getSelection().fireDataEvent("change");
			}
			*/
		}, this);
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	}, this);
	
	
	var btnModificarProducto = new qx.ui.menu.Button("Modificar producto...");
	btnModificarProducto.setEnabled(false);
	btnModificarProducto.addListener("execute", function(e) {
		var id_producto = tableModel.getRowData(tbl.getFocusedRow()).id_producto;
		var win = new componente.elpintao.ramon.productos.windowProducto(nodoActual.get("id_arbol"), id_producto, nodoActual.get("clasificacion"));
		win.addListener("aceptado", function(e){
			bandera_id_producto = id_producto;
			
			this.actualizar();
			
			/*
			if (this.banderaModoBuscar) {
				txtBuscar.fireDataEvent("changeValue");
			} else {
				tree.getSelection().fireDataEvent("change");
			}
			*/
		}, this);
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	}, this);
	
	
	var btnEditarStock = new qx.ui.menu.Button("Edición de stock sucursales...");
	btnEditarStock.setEnabled(false);
	btnEditarStock.addListener("execute", function(e) {
		var id_producto = tableModel.getRowData(tbl.getFocusedRow()).id_producto;
		var win = new componente.elpintao.ramon.productos.windowStock(nodoActual.get("id_arbol"), id_producto, nodoActual.get("clasificacion"));
		win.addListener("aceptado", function(e){
			bandera_id_producto = id_producto;
			
			this.actualizar();
			
			/*
			if (this.banderaModoBuscar) {
				txtBuscar.fireDataEvent("changeValue");
			} else {
				tree.getSelection().fireDataEvent("change");
			}
			*/
		}, this);
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	}, this);
	
	
	var btnEditarPrecios = new qx.ui.menu.Button("Edición de precios...", null, commandEditarPrecios);
	btnEditarPrecios.setEnabled(false);
	
	var btnHistoricoPrecio = new qx.ui.menu.Button("Modificar producto...");
	btnHistoricoPrecio.setEnabled(false);
	btnHistoricoPrecio.addListener("execute", function(e) {
		
	});
	
	var btnCortarProducto = new qx.ui.menu.Button("Cortar");
	btnCortarProducto.setEnabled(false);
	btnCortarProducto.addListener("execute", function(e){
		cortado = {origen: "tabla", row: tableModel.getRowData(tbl.getFocusedRow())};
		btnPegar.setEnabled(true);
		menuTree.memorizar([btnPegar]);
	});
	
	var btnEliminarProducto = new qx.ui.menu.Button("Eliminar producto");
	btnEliminarProducto.setEnabled(false);
	btnEliminarProducto.addListener("execute", function(e){
		var focusedRow = tableModel.getRowData(tbl.getFocusedRow());
		var id_producto = focusedRow.id_producto;
		var texto = "Desea eliminar el producto '" + focusedRow.descrip + "' y todos sus items?";
		/*
		for (var x = 0; x < tableModel.getRowCount(); x++) {
			focusedRow = tableModel.getRowData(x);
			if (focusedRow.id_producto == id_producto) {
				texto = texto + "<BR />" + focusedRow.capacidad + " " + focusedRow.unidad + " " + focusedRow.color;
			}
		}
		*/
		texto = texto + "<BR /> &nbsp;";
		
		
		dialog.Dialog.confirm(texto, qx.lang.Function.bind(function(e){
			if (e) {
				var p = {};
				p.id_producto = id_producto;
				p.id_arbol = nodoActual.get("id_arbol");
				
				var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Productos");
				try {
					var resultado = rpc.callSync("eliminar_producto", p);
				} catch (ex) {
					alert("Sync exception: " + ex);
				}
				nodoActual.set("cant_productos", nodoActual.get("cant_productos") - 1);
				
				this.actualizar();
				
				/*
				if (this.banderaModoBuscar) {
					txtBuscar.fireDataEvent("changeValue");
				} else {
					tree.getSelection().fireDataEvent("change");
				}
				*/
			}
		}, this));
	}, this);

	
	var menutblPaciente = new componente.general.ramon.ui.menu.Menu();
	//menutblPaciente.add(btnNuevoProducto);
	//menutblPaciente.addSeparator();
	menutblPaciente.add(btnModificarProducto);
	//menutblPaciente.add(btnEditarStock);
	menutblPaciente.add(btnEditarPrecios);
	menutblPaciente.addSeparator();
	menutblPaciente.add(btnCortarProducto);
	menutblPaciente.addSeparator();
	menutblPaciente.add(btnEliminarProducto);
	menutblPaciente.memorizar();
	
	
	//Tabla

	var tableModel = new qx.ui.table.model.Simple();
	tableModel.setColumns(["Fábrica", "Producto", "Capac.", "U", "Color", "P.lis.+IVA", "Costo", "Precio CF", "Util.CF", "Precio may.", "Util.may.", "Stock"], ["fabrica", "descrip", "capacidad", "unidad", "color", "plmasiva", "costo", "pcfcd", "utilcf", "pmaycd", "utilmay", "stock"]);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tbl = new componente.general.ramon.ui.table.Table(tableModel, custom);
	tbl.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	//tblPaciente.toggleColumnVisibilityButtonVisible();
	tbl.toggleShowCellFocusIndicator();
	tbl.toggleStatusBarVisible();
	tbl.setDraggable(true);
	tbl.setContextMenu(menutblPaciente);
	
	tbl.addListener("cellDbltap", function(e){
		commandEditarPrecios.fireDataEvent("execute");
	});
	
	
	
	var tableColumnModel = tbl.getTableColumnModel();
	var renderer = new qx.ui.table.cellrenderer.Number();
	renderer.setNumberFormat(numberformatMontoEs);
	tableColumnModel.setDataCellRenderer(5, renderer);
	tableColumnModel.setDataCellRenderer(6, renderer);
	tableColumnModel.setDataCellRenderer(7, renderer);
	tableColumnModel.setDataCellRenderer(8, renderer);
	tableColumnModel.setDataCellRenderer(9, renderer);
	tableColumnModel.setDataCellRenderer(10, renderer);
	
	

	//tableColumnModel.setColumnVisible(0, false);
  // Obtain the behavior object to manipulate
	var resizeBehavior = tableColumnModel.getBehavior();
	resizeBehavior.set(0, {width:"10%", minWidth:100});
	resizeBehavior.set(1, {width:"18%", minWidth:100});
	resizeBehavior.set(2, {width:"8%", minWidth:100});
	resizeBehavior.set(3, {width:"4%"});
	resizeBehavior.set(4, {width:"8%", minWidth:100});
	resizeBehavior.set(5, {width:"9%", minWidth:100});
	resizeBehavior.set(6, {width:"8%", minWidth:100});
	resizeBehavior.set(7, {width:"8%", minWidth:100});
	resizeBehavior.set(8, {width:"8%", minWidth:100});
	resizeBehavior.set(9, {width:"10%", minWidth:100});
	resizeBehavior.set(10, {width:"8%", minWidth:100});
	resizeBehavior.set(11, {width:"8%", minWidth:100});

	
	var selectionModel = tbl.getSelectionModel();
	selectionModel.addListener("changeSelection", function(e){
		var rowData;
		var bool = (! selectionModel.isSelectionEmpty());
		
		if (bool) {
			rowData = tableModel.getRowData(tbl.getFocusedRow());
			tbl2.buscar("id_producto", rowData.id_producto);
		}
		
		commandEditarPrecios.setEnabled(bool);
		btnModificarProducto.setEnabled(bool);
		btnEditarStock.setEnabled(bool);
		btnCortarProducto.setEnabled(bool);
		btnEliminarProducto.setEnabled(bool);
		
		menutblPaciente.memorizar([commandEditarPrecios, btnModificarProducto, btnEditarStock, btnCortarProducto, btnEliminarProducto]);
		
		if (bool && this.banderaModoBuscar) {
			var focusedRow = tbl.getFocusedRow();
			var nodo = arrayNodes[rowData.id_arbol];
			tree.openNodeAndParents(nodo);
			tree.getSelection().setItem(0, nodo);
		}
	}, this);

		
		

	
	
	
	
	
	
	
	
	
	//Tabla

	var tableModel2 = new qx.ui.table.model.Simple();
	tableModel2.setColumns(["Fábrica", "Producto"], ["fabrica", "descrip"]);
	
	tableModel2.setColumnSortable(0, false);
	tableModel2.setColumnSortable(1, false);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tbl2 = new componente.general.ramon.ui.table.Table(tableModel2, custom);
	tbl2.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tbl2.toggleColumnVisibilityButtonVisible();
	tbl2.toggleShowCellFocusIndicator();
	tbl2.toggleStatusBarVisible();
	tbl2.setDraggable(true);
	tbl2.setContextMenu(menutblPaciente);
	tbl2.setVisibility("hidden");
	
	tbl2.addListener("cellDbltap", function(e){
		commandEditarPrecios.fireDataEvent("execute");
	});
	
	
	
	var tableColumnModel2 = tbl2.getTableColumnModel();
	
	

	//tableColumnModel.setColumnVisible(0, false);
  // Obtain the behavior object to manipulate
	var resizeBehavior = tableColumnModel2.getBehavior();
	resizeBehavior.set(0, {width:"30%", minWidth:100});
	resizeBehavior.set(1, {width:"40%", minWidth:100});

	
	var selectionModel2 = tbl2.getSelectionModel();
	selectionModel2.addListener("changeSelection", function(e){
		var rowData;
		var bool = (! selectionModel2.isSelectionEmpty());
		
		if (bool) {
			rowData = tableModel2.getRowData(tbl2.getFocusedRow());
			tbl.buscar("id_producto", rowData.id_producto);
		}
		
		commandEditarPrecios.setEnabled(bool);
		btnModificarProducto.setEnabled(bool);
		btnEditarStock.setEnabled(bool);
		btnCortarProducto.setEnabled(bool);
		btnEliminarProducto.setEnabled(bool);
		
		menutblPaciente.memorizar([commandEditarPrecios, btnModificarProducto, btnEditarStock, btnCortarProducto, btnEliminarProducto]);
		
		if (bool && this.banderaModoBuscar) {
			var focusedRow = tbl2.getFocusedRow();
			var nodo = arrayNodes[rowData.id_arbol];
			tree.openNodeAndParents(nodo);
			tree.getSelection().setItem(0, nodo);
		}
	}, this);
	
	
	
	
	
	
	
	
	
	

	
	
	
	var composite1 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
	composite1.setMinWidth(100);
	composite1.setWidth(250);
	composite1.add(tree, {left: 0, top: 0, right: 0, bottom: 0});
		      
	splitpane.add(composite1, 0);
	
	
	var composite2 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
	composite2.add(slbFabrica, {left: 4, top: 0});
	composite2.add(tgbSoloProducto, {left: 154, top: 0});
	composite2.add(new qx.ui.basic.Label("Buscar:"), {left: 284, top: 3});
	composite2.add(txtBuscar, {left: 325, top: 0, right: 0});
	composite2.add(tbl, {left: 0, top: 28, right: 0, bottom: 0});
	composite2.add(tbl2, {left: 0, top: 28, right: 0, bottom: 0});
		      
	splitpane.add(composite2, 1);
	
	
	
	var p = {};
	p.id_arbol = usuario.id_arbol;
	
	var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Productos");
	try {
		var resultado = rpc.callSync("leer_arbol", p);
	} catch (ex) {
		alert("Sync exception: " + ex);
	}


	marshal.toClass(resultado, true);
	var nodes = marshal.toModel(resultado);
	
	var p = {};
	p.id_arbol = nodes.get("id_arbol");
	
	var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Productos");
	try {
		var resultado = rpc.callSync("leer_clasificacion", p);
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	

	nodes.set("clasificacion", resultado);
	
	functionPrepare(nodes, null);
	tree.setModel(nodes);
	tree.getSelection().setItem(0, nodes);
	
	
	menutblPaciente.addAt(new componente.elpintao.ramon.parametros.menubuttonOrdenamiento(tbl, "pageProductos"), 3);

	
	
	slbFabrica.setTabIndex(1);
	tgbSoloProducto.setTabIndex(2);
	txtBuscar.setTabIndex(3);
	tbl.setTabIndex(4);
	tbl2.setTabIndex(5);
	
	
	
	
	
	},
	members : 
	{
		banderaModoBuscar: false
		, actualizar : function() {
			if (this.banderaModoBuscar) {
				this.slbFabrica.fireDataEvent("changeSelection", this.slbFabrica.getSelection());
			} else {
				this.tree.getSelection().fireDataEvent("change");
			}
		}
	}
});