qx.Class.define("componente.elpintao.alejandro.Ow", {
	statics : {
		addInteresLista : function (num, interes) {
			var x = - (10000*num) / (interes*interes - 10000);
			x = x + x * interes / 100;
			return x;
		},
		delInteresLista : function (num, interes) {
			var x = num - (num * interes / 100);
			return x;
		},
		FixDecimal : function (value) {
			if (isNaN(value))
				value = 0;
			value=Math.round(value*100)/100;
			value=value.toFixed(2);
			return value;
		},
		CheckCuit : function (cuit) {
			var multiplos = new Array(9);
			multiplos[0] = 5;
			multiplos[1] = 4;
			multiplos[2] = 3;
			multiplos[3] = 2;
			multiplos[4] = 7;
			multiplos[5] = 6;
			multiplos[6] = 5;
			multiplos[7] = 4;
			multiplos[8] = 3;
			multiplos[9] = 2;
			var sumador = 0;

			if (cuit.length == 11) {
				for(var i=0;i<((cuit.length)-1);i++) {
					sumador = sumador + (cuit.charAt(i) * multiplos[i]);
				}

				sumador = (11 - (sumador % 11)) % 11;

				if (cuit.charAt(10) != sumador) {
					return false;
				} else {
					return true;
				}
			} else {
				return false;
			}
		},
		getTableHTML : function (table, app, format, titulo) {
			var tm = table.getTableModel();
			var tcm = table.getTableColumnModel();
			if (!titulo) {
				titulo = "";
			}

			var cols = new Array();
			for (var i=0; i<tm.getColumnCount(); i++) {
//				if (tcm.isColumnVisible(i)) {
					cols.push({id:i, nombre: tm.getColumnName(i), visible:tcm.isColumnVisible(i)});
//					app.debug(tm.getColumnName(i) + " - Col: " + i);
//				} else {
//					app.debug(tm.getColumnName(i) + " - Oculta Col: " + i);
//				}
			}

			var html = "<table " + format.table + " >\n<tr><td colspan='100'><input type='text' value='" + titulo + "' style='width: 100%;' /></td></tr>\n<tr style='font-size:12; font-weight: bold;' align='center'>\n";
			for (var td=0; td<cols.length; td++) {
				if (cols[td].visible) {
					html += "\t<td>" + cols[td].nombre + "</td>\n";
				}
			}
			html +="</tr>\n";

			var datos = tm.getData();
//			app.debug(datos.length-1);
			for (var tr=0; tr<(datos.length); tr++) {
				html +="<tr>\n";
				for (var td=0; td<(cols.length); td++) {
					if (cols[td].visible) {
						if (isNaN(datos[tr][td])) {
							if (datos[tr][td]) {
								html +="\t<td>" + datos[tr][td] + "</td>\n";
							} else {
								html +="\t<td>&nbsp;</td>\n";
							}
						} else {
							html +="\t<td>" + componente.elpintao.alejandro.Ow.FixDecimal(datos[tr][td]) + "</td>\n";
						}
					}
				}
				html +="</tr>\n";
			}
			html +="</table>";

			var winDemo = new qx.ui.window.Window("Impresion");
			winDemo.set({modal:false, layout:new qx.ui.layout.Canvas(), showMaximize:false, allowMaximize:false, showMinimize:false, showClose:true, movable:true, resizable:false, showStatusbar:false});
			winDemo.setWidth(800);
			winDemo.setHeight(500);
			var frame = new qx.ui.embed.Iframe("");
			frame.addListener("load", function() {
				var doc = frame.getDocument();

//				doc.body.innerHTML = funciones.ow.getTableHTML(app._tblGral, app, {table:"border='1' cellspacing='0' cellpadding='0' width='100%'"});
				doc.body.innerHTML = html;

			}, app);
			var btn = new qx.ui.form.Button("Imprimir");
			btn.addListener("execute", function () {
				frame.getWindow().print();
			});
			winDemo.add(btn, {top:0, left:0});
			winDemo.add(frame, {top: 30, left:0, right:0, bottom:0});
			winDemo.center();
//			winDemo.open();
			return winDemo;
//			return html;
		},
		getDatosTabla : function (tabla) {
			var datos = Array();
			for (var i=0; i<tabla.getTableModel().getRowCount(); i++) {
				var row = {};
				for (var j=0; j<tabla.getTableModel().getColumnCount(); j++) {
					if (tabla.getTableColumnModel().isColumnVisible(j)) {
						//datos[tabla.getTableModel().getColumnName(j)];
						if (tabla.getTableModel().getValue(j, i) == null) {
							row[tabla.getTableModel().getColumnName(j)] = "";
						} else {
							row[tabla.getTableModel().getColumnName(j)] = tabla.getTableModel().getValue(j, i);
						}
					}
				}
				datos.push(row);
			}
			return datos;
		},
		JSONaExcel : function (JSONData, ReportTitle, ShowLabel) {
			//alert(qx.lang.Json.stringify(JSONData, " ", " "));
			//return false;
			//If JSONData is not an object then JSON.parse will parse the JSON string in an Object
			var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

			var CSV = '';
			//Set Report title in first row or line

			CSV += ReportTitle + '\r\n\n';

			//This condition will generate the Label/Header
			if (ShowLabel) {
					var row = "";

					//This loop will extract the label from 1st index of on array
					for (var index in arrData[0]) {

							//Now convert each value to string and comma-seprated
							row += index + ';';
					}

					row = row.slice(0, -1);

					//append Label row with line break
					CSV += row + '\r\n';
			}

			//1st loop is to extract each row
			for (var i = 0; i < arrData.length; i++) {
					var row = "";

					//2nd loop will extract each column and convert it in string comma-seprated
					for (var index in arrData[i]) {
							arrData[i][index] = String(arrData[i][index]).replace(".", ",");
							//alert(arrData[i][index]);
							row += '' + arrData[i][index] + ';';
					}

					row.slice(0, row.length - 1);

					//add a line break after each row
					CSV += row + '\r\n';
			}

			if (CSV == '') {
					alert("Invalid data");
					return;
			}

			//Generate a file name
			var fileName = "Reporte_";
			//this will remove the blank-spaces from the title and replace it with an underscore
			fileName += ReportTitle.replace(/ /g,"_");

			//Initialize file format you want csv or xls
			var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

			// Now the little tricky part.
			// you can use either>> window.open(uri);
			// but this will not work in some browsers
			// or you will not get the correct file extension

			//this trick will generate a temp <a /> tag
			var link = document.createElement("a");
			link.href = uri;

			//set the visibility hidden so it will not effect on your web-layout
			link.style = "visibility:hidden";
			link.download = fileName + ".csv";

			//alert(link);

			//this part will append the anchor tag and remove it after automatic click
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

		}
	}
});
