/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * This is the main application class of your custom application "elpintao"
 *
 * @asset(elpintao/*)
 */
qx.Class.define("elpintao.Application",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     * 
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */




     
      
     
      // Document is the application root
	var doc = this.getRoot();
	
      
      
	var rpc = new qx.io.remote.Rpc("services/", "comp.Conexion");
	try {
		var resultado = rpc.callSync("leer_conexion");
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	
	var conexion = this.conexion = resultado;
      
      
      
	
	
	var id_version = 2;
	
	var rpc = new qx.io.remote.Rpc("services/", "comp.Base");
	try {
		var resultado = rpc.callSync("leer_version");
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	
	if (id_version == resultado.id_version) {
		qx.event.Timer.once(function(){
			var win = new elpintao.comp.varios.windowLogin();
			win.addListener("aceptado", function(e){
				var data = e.getData();
				
				this.usuario = data;
				
				qx.event.Timer.once(function(){
					this.initApp();
				}, this, 20);
			}, this);
			win.setModal(true);
			doc.add(win);
			win.center();
			win.open();
		}, this, 20);
		
	} else {
		alert("Presione F5 para actualizar aplicación. Si el problema persiste comunicarse con servicio técnico.");
		
		location.reload(true);
	}
	
	
	

	
    },
    
    
	initApp: function()
	{
		
		
      // Document is the application root
	var doc = this.getRoot();
      
	doc.set({blockerColor: '#bfbfbf', blockerOpacity: 0.4});
	//doc.set({blockerColor: 'white', blockerOpacity: 0.4});

		
		
	var pageProductos = null;
	var pageHistoricoPrecio = null;
	var pageHistoricoProducto = null;
	var pagePedidosInt = null;
	var pageGeneradorRemitos = null;
	var pagePedidosSuc = null;
	var pagePedidosExt = this.pagePedidosExt = null;
	var pageRemitosEmi = null;
	var pageRemitosRec = null;
	var pageResumenRemitos = null;
	var windowMensajes = null;
	var objExistente = {};
	var objPunteoPedidoExt = {};
	var objTransmision = {};
	var arraySucursales;
	var arrayDeposito;
	var contexto = this;
	
	var usuario = this.usuario;
	
	
	var numberformatMontoEs = this.numberformatMontoEs = new qx.util.format.NumberFormat("es");
	numberformatMontoEs.setGroupingUsed(true);
	numberformatMontoEs.setMaximumFractionDigits(2);
	numberformatMontoEs.setMinimumFractionDigits(2);
	
	var numberformatMontoEn = this.numberformatMontoEn = new qx.util.format.NumberFormat("en");
	numberformatMontoEn.setGroupingUsed(false);
	numberformatMontoEn.setMaximumFractionDigits(2);
	numberformatMontoEn.setMinimumFractionDigits(2);
	
	var numberformatEntero = this.numberformatEntero = new qx.util.format.NumberFormat("en");
	numberformatEntero.setGroupingUsed(false);
	numberformatEntero.setMaximumFractionDigits(0);
	numberformatEntero.setMinimumFractionDigits(0);
	
	
	
	
	
	var functionActualizarPedidoExt = this.functionActualizarPedidoExt = function(parametro) {
		if (pagePedidosExt != null) {
			tabviewMain.setSelection([pagePedidosExt]);
			pagePedidosExt.functionActualizarPedidosExt(parametro);
		}
	}

	var functionPuntearPedidoExt = this.functionPuntearPedidoExt = function(parametro) {
		if (objPunteoPedidoExt[parametro.id_pedido_ext]==null) {
			objPunteoPedidoExt[parametro.id_pedido_ext] = new elpintao.comp.pedidos.pagePunteoPedidoExt(parametro);
			
			objPunteoPedidoExt[parametro.id_pedido_ext].addListenerOnce("close", function(e){
				objPunteoPedidoExt[parametro.id_pedido_ext] = null;
			});
			tabviewMain.add(objPunteoPedidoExt[parametro.id_pedido_ext]);
		}
		tabviewMain.setSelection([objPunteoPedidoExt[parametro.id_pedido_ext]])
	};
	
	
	var functionTransmitir = this.functionTransmitir = function() {
		var req = new qx.io.remote.Request("services/cron_suc.php");
		req.setTimeout(60000 * 5);
		req.addListener("completed", function(e) {
			timerTransmision.fireEvent("interval");
		});

		req.send();
	};
	
	
	var functionLogin = this.functionLogin = function (functionSuccess) {
		/*
		var checkearCredentials = function(username, password, callback) {
			loginWidget._username.setValid(true);
			loginWidget._password.setValid(true);
			
			var p = {};
			p.nick = username;
			p.password = password;
			
			var rpc = new qx.io.remote.Rpc("services/", "comp.Usuarios");
			rpc.setTimeout(1000 * 60);
			rpc.callAsync(function(resultado, error, id){
				if (error) {
					callback(error);
				} else {
					if (resultado.id_arbol == null) {
						callback({message: "id_arbol"});
					} else {
						callback(null, resultado);
					}
				}
			}, "leer_usuario", p);
		}
		
		var finalCallback = function(err, data) {
			if(err) {
				//alert(qx.lang.Json.stringify(err, null, 2));
			} else {
				//alert(qx.lang.Json.stringify(data, null, 2));
			}
		}
		*/
	
		var loginWidget = new dialog.Login({
			text : "Ingrese datos de identificación",
			checkCredentials : function(username, password, callback) {
				loginWidget._username.setValid(true);
				loginWidget._password.setValid(true);
				
				var p = {};
				p.nick = username;
				p.password = password;
				
				var rpc = new qx.io.remote.Rpc("services/", "comp.Usuarios");
				rpc.setTimeout(1000 * 60);
				rpc.callAsync(function(resultado, error, id){
					if (error) {
						callback(error);
					} else {
						for (var x in resultado) {
							usuario[x] = resultado[x];
						}
	
						callback(null, resultado);
					}
				}, "leer_usuario", p);
			},
			callback : function(err, data) {
				if(err) {
					//alert(qx.lang.Json.stringify(err, null, 2));
				} else {
					//alert(qx.lang.Json.stringify(data, null, 2));
				}
			}
		});
		
		loginWidget._username.getLayoutParent().getLayout().getCellWidget(0, 0).setValue("Usuario:");
		loginWidget._username.getLayoutParent().getLayout().getCellWidget(1, 0).setValue("Contraseña:");
		
		//loginWidget._username.getLayoutParent().getLayout().getCellWidget(0, 1).setValue("ramonpaz");
		//loginWidget._username.getLayoutParent().getLayout().getCellWidget(1, 1).setValue("ramonpaz");
		
		
		loginWidget._password.setInvalidMessage("Contraseña incorrecta");
		loginWidget._loginButton.setLabel("Aceptar");
		loginWidget._cancelButton.setVisibility("hidden");
		
		loginWidget._username.addListener("appear", function(e) {
			loginWidget._username.focus();
		});
		
		loginWidget.addListener("loginSuccess", functionSuccess);
		loginWidget.addListener("loginFailure", function(e){
			var data = e.getData();
			if (data.message=="id_arbol") {
				loginWidget._username.setInvalidMessage("El usuario no cuenta con los permisos necesarios");
				loginWidget._username.setValid(false);
				loginWidget._username.focus();
			} else if (data.message=="nick") {
				loginWidget._username.setInvalidMessage("Usuario no encontrado");
				loginWidget._username.setValid(false);
				loginWidget._username.focus();
			} else if (data.message=="password") {
				loginWidget._password.setValid(false);
				loginWidget._password.focus();
			}
		});
		
		loginWidget.show();
	}
	
	
	var functionChequearPassword = this.functionChequearPassword = function (password_chequear, functionSuccess) {
		var checkCredentials = function(username, password, callback) {
			if (password == password_chequear) {
				callback( null, password);
			} else {
				callback( "Contraseña incorrecta" );
			}
		}
		
		var finalCallback = function(err, data) {
			if(err) {
				dialog.Dialog.alert(err, function(e) {
					loginWidget._password.focus();
				});
			} else {
				//alert(data);
			}
		}
			
		var loginWidget = new dialog.Login({
			text        : "Ingrese contraseña de autorización",
			checkCredentials : checkCredentials,
			callback    : finalCallback
		});
		
		loginWidget._username.setVisibility("excluded");
		loginWidget._username.getLayoutParent().getLayout().getCellWidget(0, 0).setVisibility("excluded");
		loginWidget._username.getLayoutParent().getLayout().getCellWidget(1, 0).setValue("Contraseña:");
		loginWidget._loginButton.setLabel("Aceptar");
		loginWidget._password.addListenerOnce("appear", function(e) {
			loginWidget._password.focus();
		});
		
		loginWidget.addListener("loginSuccess", functionSuccess, contexto);
		loginWidget.addListener("loginFailure", function(e){
			//loginWidget._password.focus();
		});
		 loginWidget.show();
	}
	
	
	/*
	var functionChequearPassword = this.functionChequearPassword = function (password_chequear, functionSuccess) {
		var sampleCallbackFunc = function(username, password, callback, context) {
			if (password == password_chequear) {
				callback.call(context, true);
			} else {
				callback.call(context, false, "Contraseña incorrecta");
			}
		}
			
		var loginWidget = new dialog.Login({
			text        : "Ingrese contraseña de autorización",
			callback    : sampleCallbackFunc,
			context     : contexto
		});
		
		loginWidget._username.setVisibility("excluded");
		loginWidget._username.getLayoutParent().getLayout().getCellWidget(0, 0).setVisibility("excluded");
		loginWidget._username.getLayoutParent().getLayout().getCellWidget(1, 0).setValue("Contraseña:");
		loginWidget._loginButton.setLabel("Aceptar");
		
		loginWidget.addListener("loginSuccess", functionSuccess, contexto);
		loginWidget.addListener("loginFailure", function(e){
			dialog.Dialog.warning(e.getData());
		});
		 loginWidget.show();
	}
	*/
	
	var commandF5 = new qx.ui.command.Command("F5");
	var commandCtrlR = new qx.ui.command.Command("Ctrl+R");
	
	
	
	
	
	var conexion = this.conexion;
	
	
	
	
	var rpc = new qx.io.remote.Rpc(conexion.rpc_elpintao_services, "componente.elpintao.ramon.Base_elpintao");
	try {
		var resultado = rpc.callSync("leer_paramet");
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	this.rowParamet = resultado;
	
	
	
	var rpc = new qx.io.remote.Rpc(conexion.rpc_elpintao_services, "componente.elpintao.ramon.Base_elpintao");
	try {
		var resultado = rpc.callSync("leer_sucursales");
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	this.arraySucursales = resultado;
	
	
	var rpc = new qx.io.remote.Rpc(conexion.rpc_elpintao_services, "componente.elpintao.ramon.Base_elpintao");
	try {
		var resultado = rpc.callSync("leer_depositos");
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	this.arrayDeposito = resultado;
	
	
	
	
	/*
	var objFabrica = this.objFabrica = {};
	objFabrica.store = new qx.data.store.Json();
	objFabrica.store.addListener("loaded", function(e){
		var model = e.getData();
		objFabrica.indice = [];
		for (var i = 0; i < model.length; i++) {
			objFabrica.indice[model.getItem(i).get("id_fabrica")] = model.getItem(i);
			objFabrica.indice[model.getItem(i).get("descrip")] = model.getItem(i);
		}
	});
	objFabrica.store.setUrl("services/class/comp/Stores.php?rutina=leer_fabrica");
	*/
	componente.elpintao.ramon.Rutinas.crear_obj_base(["objFabrica"]);
		
	/*
	var objColor = this.objColor = {};
	objColor.store = new qx.data.store.Json();
	objColor.store.addListener("loaded", function(e){
		var model = e.getData();
		objColor.indice = [];
		for (var i = 0; i < model.length; i++) {
			objColor.indice[model.getItem(i).get("id_color")] = model.getItem(i);
			objColor.indice[model.getItem(i).get("descrip")] = model.getItem(i);
		}
	});
	objColor.store.setUrl("services/class/comp/Stores.php?rutina=leer_color");
	*/
	componente.elpintao.ramon.Rutinas.crear_obj_base(["objColor"]);
	
	/*
	var objMoneda = this.objMoneda = {};
	objMoneda.store = new qx.data.store.Json();
	objMoneda.store.addListener("loaded", function(e){
		var model = e.getData();
		objMoneda.indice = [];
		for (var i = 0; i < model.length; i++) {
			objMoneda.indice[model.getItem(i).get("id_moneda")] = model.getItem(i);
			objMoneda.indice[model.getItem(i).get("descrip")] = model.getItem(i);
		}
	});
	objMoneda.store.setUrl("services/class/comp/Stores.php?rutina=leer_moneda");
	*/
	componente.elpintao.ramon.Rutinas.crear_obj_base(["objMoneda"]);
		
	/*
	var objUnidad = this.objUnidad = {};
	objUnidad.store = new qx.data.store.Json();
	objUnidad.store.addListener("loaded", function(e){
		var model = e.getData();
		objUnidad.indice = [];
		for (var i = 0; i < model.length; i++) {
			objUnidad.indice[model.getItem(i).get("id_unidad")] = model.getItem(i);
			objUnidad.indice[model.getItem(i).get("descrip")] = model.getItem(i);
		}
	});
	objUnidad.store.setUrl("services/class/comp/Stores.php?rutina=leer_unidad");
	*/
	componente.elpintao.ramon.Rutinas.crear_obj_base(["objUnidad"]);
	
	var objTransporte = this.objTransporte = {};
	objTransporte.store = new qx.data.store.Json();
	objTransporte.store.addListener("loaded", function(e){
		var model = e.getData();
		objTransporte.indice = [];
		for (var i = 0; i < model.length; i++) {
			objTransporte.indice[model.getItem(i).get("id_transporte")] = model.getItem(i);
			objTransporte.indice[model.getItem(i).get("descrip")] = model.getItem(i);
		}
	});
	objTransporte.store.setUrl(conexion.rpc_elpintao_services + "class/componente/elpintao/ramon/Stores.php?rutina=leer_transporte");
	
	var objUsuario = this.objUsuario = {};
	objUsuario.store = new qx.data.store.Json();
	objUsuario.store.addListener("loaded", function(e){
		var model = e.getData();
		objUsuario.indice = [];
		for (var i = 0; i < model.length; i++) {
			objUsuario.indice[model.getItem(i).get("id_usuario")] = model.getItem(i);
			objUsuario.indice[model.getItem(i).get("nick")] = model.getItem(i);
		}
	});
	objUsuario.store.setUrl(conexion.rpc_elpintao_services + "class/componente/elpintao/ramon/Stores.php?rutina=leer_usuario");
	
	
	
	
	var timerTransmision = this.timerTransmision = new qx.event.Timer(30000 * 1);
	timerTransmision.addListener("interval", function(e){
		var rpc = new qx.io.remote.Rpc("services/", "comp.Transmision_SA");
		rpc.setTimeout(60000 * 5);
		rpc.callAsync(function(resultado, error, id) {
			for (var x in resultado) {
				if (resultado[x].length==0) {
					objTransmision[x].resultado = resultado[x];
					objTransmision[x].button.setIcon('elpintao/boton_verde.png');
				} else {
					objTransmision[x].resultado = objTransmision[x].resultado.concat(resultado[x]);
					if (objTransmision[x].resultado.length <= 2) {
						objTransmision[x].button.setIcon('elpintao/boton_amarillo.png');
					} else {
						objTransmision[x].button.setIcon('elpintao/boton_rojo.png');
					}
				}
			}
		}, "leer_transmision_error");
	});
	timerTransmision.start();
	
	
	
	var contenedorMain = new qx.ui.container.Composite(new qx.ui.layout.Grow());
	var tabviewMain = this._tabviewMain = new qx.ui.tabview.TabView();
	
	contenedorMain.add(tabviewMain);
	
	
	var mnuArchivo = new qx.ui.menu.Menu();
	var btnAcercaDe = new qx.ui.menu.Button("Acerca de...");
	btnAcercaDe.addListener("execute", function(){
		var win = new elpintao.comp.varios.windowAcercaDe();
		win.setModal(true);
		doc.add(win);
		win.center();
		win.open();
	});
	mnuArchivo.add(btnAcercaDe);
	  
	var mnuCentral = new qx.ui.menu.Menu();
	var btnProductos = new qx.ui.menu.Button("Productos");
	btnProductos.addListener("execute", function(e){
		if (usuario.id_arbol == null) {
			dialog.Dialog.error("El usuario no cuenta con los permisos necesarios");
		} else {
			if (pageProductos==null) {
				pageProductos = new elpintao.comp.productos.pageProductos(usuario);
				//pageProductos = new elpintao.comp.productos.pageProductos({id_arbol: 1});
				pageProductos.addListenerOnce("close", function(e){
					pageProductos = null;
				});
				tabviewMain.add(pageProductos);
				tabviewMain.setSelection([pageProductos]);
			} else tabviewMain.setSelection([pageProductos]);
		}
	}, this);
	mnuCentral.add(btnProductos);
	
	var btnHistoricoPrecio = new qx.ui.menu.Button("Historico precio");
	btnHistoricoPrecio.addListener("execute", function(e){
		if (pageHistoricoPrecio==null) {
			pageHistoricoPrecio = new elpintao.comp.productos.pageHistoricoPrecio();
			pageHistoricoPrecio.addListenerOnce("close", function(e){
				pageHistoricoPrecio = null;
			});
			tabviewMain.add(pageHistoricoPrecio);
			tabviewMain.setSelection([pageHistoricoPrecio]);
		} else tabviewMain.setSelection([pageHistoricoPrecio]);
	}, this);
	mnuCentral.add(btnHistoricoPrecio);
	
	
	var btnHistoricoProducto = new qx.ui.menu.Button("Historico producto");
	btnHistoricoProducto.addListener("execute", function(e){
		if (pageHistoricoProducto==null) {
			pageHistoricoProducto = new elpintao.comp.productos.pageHistoricoProducto();
			pageHistoricoProducto.addListenerOnce("close", function(e){
				pageHistoricoProducto = null;
			});
			tabviewMain.add(pageHistoricoProducto);
			tabviewMain.setSelection([pageHistoricoProducto]);
		} else tabviewMain.setSelection([pageHistoricoProducto]);
	}, this);
	mnuCentral.add(btnHistoricoProducto);
	
	
	var btnAplicarAjuste = new qx.ui.menu.Button("Aplicar ajustes desde Raiz de prod.");
	btnAplicarAjuste.addListener("execute", function(e){
		var win = new componente.elpintao.ramon.productos.windowAplicarAjustes("1");
		win.addListener("aceptado", function(e){
			if (pageProductos != null) pageProductos.actualizar();

			/*
			if (banderaModoBuscar) {
				slbFabrica.fireEvent("changeSelection");
			} else {
				tree.getSelection().fireDataEvent("change");
			}
			*/
		});
		win.setModal(true);
		this.getRoot().add(win);
		win.center();
		win.open();
	}, this);
	mnuCentral.add(btnAplicarAjuste);
	mnuCentral.addSeparator();
	
	
	var btnCargaStock2 = new qx.ui.menu.Button("Asignar stock");
	btnCargaStock2.addListener("execute", function(e){
		functionChequearPassword(this.rowParamet.password_asignar_stock, function(e) {
			var win = new elpintao.comp.productos.windowStock();
			win.setModal(true);
			this.getRoot().add(win);
			win.center();
			win.open();
		});
	}, this);
	mnuCentral.add(btnCargaStock2);
	mnuCentral.addSeparator();

	
	var btnReparar = new qx.ui.menu.Button("Reparar cadenas de búsqueda");
	btnReparar.addListener("execute", function(e){
		dialog.Dialog.confirm("Desea reparar cadenas de búsqueda? El proceso puede llevar algún tiempo, se notificará cuando finalice.", function(e){
			if (e) {
				var bounds = doc.getBounds();
				var imageLoading = new qx.ui.basic.Image("elpintao/loading66.gif");
				imageLoading.setBackgroundColor("#FFFFFF");
				imageLoading.setDecorator("main");
				doc.add(imageLoading, {left: parseInt(bounds.width / 2 - 33), top: parseInt(bounds.height / 2 - 33)});
				
				var rpc = new qx.io.remote.Rpc("services/", "comp.Reparacion");
				rpc.setTimeout(60000 * 60 * 6);
				rpc.callAsync(function(resultado, error, id) {
					
					imageLoading.destroy();
					dialog.Dialog.alert("Reparación cadenas de búsqueda terminada. " + resultado + " items activos corregidos.");
				}, "arreglar_campo_busqueda");
			}
		});
	}, this);
	mnuCentral.add(btnReparar);
	mnuCentral.addSeparator();
	
	var btnPedidosExt = new qx.ui.menu.Button("Pedidos a proveedores");
	btnPedidosExt.addListener("execute", function(e){
		if (pagePedidosExt==null) {
			pagePedidosExt = this.pagePedidosExt = new elpintao.comp.pedidos.pagePedidosExt(this);
			
			pagePedidosExt.addListenerOnce("close", function(e){
				pagePedidosExt = null;
			});
			tabviewMain.add(pagePedidosExt);
		}
		tabviewMain.setSelection([pagePedidosExt])
	}, this);
	mnuCentral.add(btnPedidosExt);
	
	var btnPedidosSuc = new qx.ui.menu.Button("Pedidos de sucursal");
	btnPedidosSuc.addListener("execute", function(e){
		if (pagePedidosSuc==null) {
			pagePedidosSuc = this.pagePedidosSuc = new elpintao.comp.deposito.pagePedidosSuc();
			
			pagePedidosSuc.addListenerOnce("close", function(e){
				pagePedidosSuc = null;
			});
			tabviewMain.add(pagePedidosSuc);
		}
		tabviewMain.setSelection([pagePedidosSuc]);
	}, this);
	mnuCentral.add(btnPedidosSuc);
	mnuCentral.addSeparator()
	
	var btnRemitosEmiCentral = new qx.ui.menu.Button("Salidas de mercaderia (Remitos)");
	btnRemitosEmiCentral.addListener("execute", function(e){
		if (pageRemitosEmi==null) {
			pageRemitosEmi = this.pageRemitosEmi = new elpintao.comp.remitos.pageRemitos(true);
			
			pageRemitosEmi.addListenerOnce("close", function(e){
				pageRemitosEmi = null;
			});
			tabviewMain.add(pageRemitosEmi);
		}
		tabviewMain.setSelection([pageRemitosEmi])

		
		/*
		var win = new elpintao.comp.productos.windowPrueba();

			win.setModal(true);
			this.getRoot().add(win);
			win.center();
			win.open();
			*/
	}, this);
	mnuCentral.add(btnRemitosEmiCentral);
	
	var btnRemitosRecCentral = new qx.ui.menu.Button("Entradas de mercaderia (Remitos)");
	btnRemitosRecCentral.addListener("execute", function(e){
		if (pageRemitosRec==null) {
			pageRemitosRec = this.pageRemitosRec = new elpintao.comp.remitos.pageRemitos(false);
			
			pageRemitosRec.addListenerOnce("close", function(e){
				pageRemitosRec = null;
			});
			tabviewMain.add(pageRemitosRec);
		}
		tabviewMain.setSelection([pageRemitosRec])
	}, this);
	mnuCentral.add(btnRemitosRecCentral);
	
	var btnResumenRemitos = new qx.ui.menu.Button("Resumen de salidas de mercaderia");
	btnResumenRemitos.addListener("execute", function(e){
		if (pageResumenRemitos==null) {
			pageResumenRemitos = new elpintao.comp.remitos.pageResumenRemitos();
			
			pageResumenRemitos.addListenerOnce("close", function(e){
				pageResumenRemitos = null;
			});
			tabviewMain.add(pageResumenRemitos);
		}
		tabviewMain.setSelection([pageResumenRemitos])
	}, this);
	mnuCentral.add(btnResumenRemitos);
	mnuCentral.addSeparator()
	
	var btnCuentas = new qx.ui.menu.Button("Cuentas");
	btnCuentas.addListener("execute", function(e){
		functionChequearPassword(this.rowParamet.password_general, function(e) {
			var win = new elpintao.comp.cuentas.windowPrincipal();
			win.setModal(true);
			this.getRoot().add(win);
			win.center();
			win.open();
		});
	}, this);
	mnuCentral.add(btnCuentas);
	mnuCentral.addSeparator()
	
	var btnSucursales = new qx.ui.menu.Button("Sucursales");
	btnSucursales.addListener("execute", function(e){
		functionChequearPassword(this.rowParamet.password_general, function(e) {
			var win = new elpintao.comp.parametros.windowSucursales();
			win.setModal(true);
			this.getRoot().add(win);
			win.center();
			win.open();
		});
	}, this);
	mnuCentral.add(btnSucursales);
	
	var btnUsuarios = new qx.ui.menu.Button("Usuarios");
	btnUsuarios.addListener("execute", function(e){
		functionChequearPassword(this.rowParamet.password_general, function(e) {
			var win = new elpintao.comp.parametros.windowUsuarios();
			win.setModal(true);
			this.getRoot().add(win);
			win.center();
			win.open();
		});
	}, this);
	mnuCentral.add(btnUsuarios);
	
	var mnuFabricas = new qx.ui.menu.Menu();
	
	var btnFabricas = new qx.ui.menu.Button("Fábricas", null, null, mnuFabricas);
	mnuCentral.add(btnFabricas);

	var btnAdminFabricas = new qx.ui.menu.Button("Administrar...");
	btnAdminFabricas.addListener("execute", function(e){
		functionChequearPassword(this.rowParamet.password_general, function(e) {
			var win = new componente.elpintao.ramon.parametros.windowFabricas();
			win.setModal(true);
			this.getRoot().add(win);
			win.center();
			win.open();
		});
	}, this);
	mnuFabricas.add(btnAdminFabricas);
	
	var btnUnirFabrica = new qx.ui.menu.Button("Unir fábrica...");
	btnUnirFabrica.addListener("execute", function(e){
		functionChequearPassword(this.rowParamet.password_general, function(e) {
			var win = new elpintao.comp.parametros.windowUnirFabrica();
			win.setModal(true);
			this.getRoot().add(win);
			win.center();
			win.open();
		});
	}, this);
	mnuFabricas.add(btnUnirFabrica);
	
	var mnuSucursal = new qx.ui.menu.Menu();
	var btnCargaStock = new qx.ui.menu.Button("Asignar stock");
	btnCargaStock.addListener("execute", function(e){
		functionChequearPassword(this.rowParamet.password_asignar_stock, function(e) {
			var win = new elpintao.comp.productos.windowStock();
			win.setModal(true);
			this.getRoot().add(win);
			win.center();
			win.open();
		});
	}, this);
	mnuSucursal.add(btnCargaStock);
	mnuSucursal.addSeparator();
	
	var btnPedidos = new qx.ui.menu.Button("Pedidos a depósito");
	btnPedidos.addListener("execute", function(e){
		if (pagePedidosInt==null) {
			pagePedidosInt = new elpintao.comp.pedidos.pagePedidosInt(this);
			
			pagePedidosInt.addListenerOnce("close", function(e){
				pagePedidosInt = null;
			});
			tabviewMain.add(pagePedidosInt);
		}
		tabviewMain.setSelection([pagePedidosInt])
	}, this);
	mnuSucursal.add(btnPedidos);
	mnuSucursal.addSeparator();
	
	var btnRemitosEmi = new qx.ui.menu.Button("Salidas de mercaderia (Remitos)");
	btnRemitosEmi.addListener("execute", function(e){
		if (pageRemitosEmi==null) {
			pageRemitosEmi = this.pageRemitosEmi = new elpintao.comp.remitos.pageRemitos(true);
			
			pageRemitosEmi.addListenerOnce("close", function(e){
				pageRemitosEmi = null;
			});
			tabviewMain.add(pageRemitosEmi);
		}
		tabviewMain.setSelection([pageRemitosEmi])
		
		/*
		if (pageRemitosEmi==null) {
			pageRemitosEmi = this.pageRemitosEmi = new elpintao.comp.remitos.pageRemitosEmi();
			
			pageRemitosEmi.addListenerOnce("close", function(e){
				pageRemitosEmi = null;
			});
			tabviewMain.add(pageRemitosEmi);
		}
		tabviewMain.setSelection([pageRemitosEmi])
		*/
	}, this);
	mnuSucursal.add(btnRemitosEmi);
	
	var btnRemitosRec = new qx.ui.menu.Button("Entradas de mercaderia (Remitos)");
	btnRemitosRec.addListener("execute", function(e){
		if (pageRemitosRec==null) {
			pageRemitosRec = this.pageRemitosRec = new elpintao.comp.remitos.pageRemitos(false);
			
			pageRemitosRec.addListenerOnce("close", function(e){
				pageRemitosRec = null;
			});
			tabviewMain.add(pageRemitosRec);
		}
		tabviewMain.setSelection([pageRemitosRec])
		
		/*
		if (pageRemitosRec==null) {
			pageRemitosRec = this.pageRemitosRec = new elpintao.comp.remitos.pageRemitosRec();
			
			pageRemitosRec.addListenerOnce("close", function(e){
				pageRemitosRec = null;
			});
			tabviewMain.add(pageRemitosRec);
		}
		tabviewMain.setSelection([pageRemitosRec])
		*/
	}, this);
	mnuSucursal.add(btnRemitosRec);
	
	
	
      var mnuSesion = new qx.ui.menu.Menu();
    
      var btnCerrar = new qx.ui.menu.Button("Cerrar");
      btnCerrar.addListener("execute", function(e){
        location.reload(true);
      });
      mnuSesion.add(btnCerrar);

	
	

	var mnubtnArchivo = new qx.ui.toolbar.MenuButton('Archivo');
	var mnubtnEdicion = new qx.ui.toolbar.MenuButton('Edición');
	var mnubtnVer = new qx.ui.toolbar.MenuButton('Ver');
	var mnubtnCentral = new qx.ui.toolbar.MenuButton('Depósito');
	var mnubtnSucursal = new qx.ui.toolbar.MenuButton('Sucursal');
	var mnubtnSesion = new qx.ui.toolbar.MenuButton('Sesión');
	
	mnubtnArchivo.setMenu(mnuArchivo);
	mnubtnCentral.setMenu(mnuCentral);
	mnubtnSucursal.setMenu(mnuSucursal);
	mnubtnSesion.setMenu(mnuSesion);
	  
	
	var toolbarMain = new qx.ui.toolbar.ToolBar();
	toolbarMain.add(mnubtnArchivo);
	toolbarMain.add(mnubtnEdicion);
	toolbarMain.add(mnubtnVer);

	toolbarMain.add(mnubtnCentral);
	//toolbarMain.add(mnubtnSucursal);
	
	toolbarMain.add(mnubtnSesion);
	
	toolbarMain.addSpacer();
	
	
	var btnMensajes = this.btnMensajes = new qx.ui.toolbar.Button("Mensajes");
	btnMensajes.addListener("execute", function(e){
		if (windowMensajes.isVisible()) {
			windowMensajes.getLayoutParent().getWindowManager().bringToFront(windowMensajes);
		} else {
			doc.add(windowMensajes, {left: doc.getBounds().width - windowMensajes.getWidth(), top: "7%", height: "90%"});
			windowMensajes.open();
		}
		windowMensajes.list.focus();
	});
	toolbarMain.add(btnMensajes);
	toolbarMain.addSpacer();
	

	
	
	for (var x in this.arraySucursales) {
		var id_sucursal = this.arraySucursales[x].id_sucursal;
		objTransmision[id_sucursal] = {};
		objTransmision[id_sucursal].resultado = [];
		var button = new qx.ui.toolbar.Button(this.arraySucursales[x].descrip, 'elpintao/boton_verde.png');
		objTransmision[id_sucursal].button = button;
		button.setShow("icon");
		button.setToolTipText(this.arraySucursales[x].descrip);
		button.setPadding(0);
		button.setUserData("id_sucursal", id_sucursal);
		button.addListener("mouseover", function(e){
			var target = e.getTarget();
			var id_sucursal = target.getUserData("id_sucursal");
			if (objTransmision[id_sucursal].resultado.length > 0) {
				popupTransmision.tblDetalle.resetSelection();
				popupTransmision.tblDetalle.setFocusedCell();
				popupTransmision.tableModel.setDataAsMapArray(objTransmision[id_sucursal].resultado, true);
			
				popupTransmision.placeToWidget(target, false);
				popupTransmision.show();
			} else {
				popupTransmision.hide();
			}
		});
		button.addListener("execute", function(e){

		});
		toolbarMain.add(button);
	}
	

	
	doc.add(toolbarMain, {left: 5, top: 0, right: 5});
	
	doc.add(contenedorMain, {left: 0, top: 33, right: 0, bottom: 0});

	
	var popupTransmision = new elpintao.comp.varios.popupTransmision();
	
	timerTransmision.fireEvent("interval");
	
	windowMensajes = new elpintao.comp.mensajes.windowMensajes();
	


	
	
	btnProductos.setEnabled(usuario.perfil["101"] != null);
	btnAplicarAjuste.setEnabled(usuario.perfil["102"] != null);
	btnCargaStock2.setEnabled(usuario.perfil["103"] != null);
	btnReparar.setEnabled(usuario.perfil["104"] != null);
	btnPedidosExt.setEnabled(usuario.perfil["105"] != null);
	btnPedidosSuc.setEnabled(usuario.perfil["106"] != null);
	btnRemitosEmiCentral.setEnabled(usuario.perfil["107"] != null);
	btnRemitosRecCentral.setEnabled(usuario.perfil["108"] != null);
	btnCuentas.setEnabled(usuario.perfil["109"] != null);
	btnSucursales.setEnabled(usuario.perfil["110"] != null);
	btnUsuarios.setEnabled(usuario.perfil["111"] != null);
	btnFabricas.setEnabled(usuario.perfil["112"] != null);
	
	
	btnCargaStock.setEnabled(usuario.perfil["201"] != null);
	btnPedidos.setEnabled(usuario.perfil["202"] != null);
	btnRemitosEmi.setEnabled(usuario.perfil["203"] != null);
	btnRemitosRec.setEnabled(usuario.perfil["204"] != null);
	
	}
  }
});
