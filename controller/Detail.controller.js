/*global location */
sap.ui.define([
	"vesi/fi/rfi/yfi_dfi_rfi/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"vesi/fi/rfi/yfi_dfi_rfi/model/formatter",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Text',
	'sap/m/MessageBox'

], function (BaseController, JSONModel, formatter, Button, Dialog, Text, MessageBox) {
	"use strict";

	return BaseController.extend("vesi.fi.rfi.yfi_dfi_rfi.controller.Detail", {

		formatter: formatter,
		objectID: null,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			this._popUpDisplayed = "";
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading")
			});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));

			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.subscribe("Master", "refreshSelected", this.reject, this);

		},

		formatData: function () {

			this.getView().byId("commentStatus").setIcon("sap-icon://message-warning");
			this.getView().byId("commentStatus").setState("Warning");
			var txt = this.getResourceBundle().getText("pending"); //this.getView().getModel("i18n").getResourceBundle().getText("pending");
			this.getView().byId("commentStatus").setText(txt);

			this.getView().byId("ecartStatus").setIcon("sap-icon://message-warning");
			this.getView().byId("ecartStatus").setState("Warning");
			var txt = this.getView().getModel("i18n").getResourceBundle().getText("pending");
			this.getView().byId("ecartStatus").setText(txt);

			this.getView().byId("dpStatus").setIcon("sap-icon://message-warning");
			this.getView().byId("dpStatus").setState("Warning");
			var txt = this.getView().getModel("i18n").getResourceBundle().getText("pending");
			this.getView().byId("dpStatus").setText(txt);

			this.getView().byId("ecartRep").setSelectedKey("0");
			this.getView().byId("comment").setValue("");
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Updates the item count within the line item table's header
		 * @param {object} oEvent an event containing the total number of items in the list
		 * @private
		 */
		onListUpdateFinished: function (oEvent) {
			var sTitle,
				iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getModel("detailView");

			// only update the counter if the length is final
			if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
				}
				oViewModel.setProperty("/lineItemListTitle", sTitle);
			}
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this._changeMasterItem = "X";

			// ONG ADD BEGIN (+)
			if (this._popUpDisplayed === "X" && this._changeMasterItem === "X") {
				sap.ui.getCore().byId("posid_input2").setValue("");
				sap.ui.getCore().byId("posid_input3").setValue("");
				sap.ui.getCore().byId("posid_input4").setValue("");
				sap.ui.getCore().byId("posid_input5").setValue("");
				sap.ui.getCore().byId("posid_input6").setValue("");
				sap.ui.getCore().byId("posid_input7").setValue("");
				sap.ui.getCore().byId("posid_input8").setValue("");
				sap.ui.getCore().byId("posid_input9").setValue("");
				sap.ui.getCore().byId("posid_input10").setValue("");
			}
			// ONG ADD END (+)

			this.objectID = sObjectId;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("DetailSet", {
					Zcle: sObjectId

				});

				var sDetailsPath = this.getModel().createKey("ListeSet", {
					Zcle: sObjectId
				});

				this._bindView("/" + sObjectPath, "/" + sDetailsPath);

			}.bind(this));

			this.formatData();

		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath, sDetailsPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");
			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			// ONG ADD
			var oView = this.getView();

			oView.bindElement({
				path: sObjectPath
			});
			// ONG ADD

			this.byId("formdetails").bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});

			this.byId("objectHeader").bindElement({
				path: sDetailsPath,
				events: {
					change: this._onBindingChange2.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});

		},
		ReplaceAll: function (str, find, replace) {
			return str.replace(new RegExp(find, 'g'), replace);
		},

		_onBindingChange: function () {
			this.updateStatus();
			// var oView = this.byId("list"),
			// 	oElementBinding = oView.getElementBinding();

			// No data for the binding
			// if (!oElementBinding.getBoundContext()) {
			// 	this.getRouter().getTargets().display("detailObjectNotFound");
			// 	// if object could not be found, the selection in the master list
			// 	// does not make sense anymore.
			// 	this.getOwnerComponent().oListSelector.clearMasterListSelection();
			// 	return;
			// }

			// var sPath = oElementBinding.getPath(),
			// 	oResourceBundle = this.getResourceBundle(),
			// 	oObject = oView.getModel().getObject(sPath),
			// 	sObjectId = oObject.Zcle,
			// 	sObjectName = oObject.ErnamNom,
			// 	oViewModel = this.getModel("detailView");

			// this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			// oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			// oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			// oViewModel.setProperty("/shareSendEmailSubject",
			// 	oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			// oViewModel.setProperty("/shareSendEmailMessage",
			// 	oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		_onBindingChange2: function () {
			// var oView = this.byId("objectHeader"),
			// 	oElementBinding = oView.getElementBinding();
		},

		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView"),
				oLineItemTable = this.byId("lineItemsList"),
				iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			oViewModel.setProperty("/lineItemTableDelay", 0);

			oLineItemTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for line item table
				oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
			});

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},

		statusPN: function (Status) {
			if (Status) {
				return "Warning";
			} else {
				return "None";
			}
		},

		validate: function () {

			var okText = this.getView().getModel("i18n").getResourceBundle().getText("ok");
			var cancelText = this.getView().getModel("i18n").getResourceBundle().getText("cancel");
			var attentionText = this.getView().getModel("i18n").getResourceBundle().getText("attention");
			var confirmationText = this.getView().getModel("i18n").getResourceBundle().getText("confirmation");

			var mess1Text = this.getView().getModel("i18n").getResourceBundle().getText("message1");
			var mess2Text = this.getView().getModel("i18n").getResourceBundle().getText("message2");
			var mess3Text = this.getView().getModel("i18n").getResourceBundle().getText("message3");

			if (this.getView().byId("dp_input").getValueState() != 'Error' || !this.getView().byId("dp_input").getVisible()) {

				var oThis = this;

				//Verifier saisie
				var posid_enabled = this.getView().byId("posid_input").getEnabled();
				var posid_value = this.getView().byId("posid_input").getValue().replace(/\s/g, '');
				var posid_status = this.getView().byId("posidStatus").getState();
				var posid_verified;
				var mandatory_verify = false;

				if ((posid_enabled && posid_value != '') || !posid_enabled) {
					posid_verified = true;
				} else {
					posid_verified = false;
				}
				if (posid_enabled) {
					mandatory_verify = mandatory_verify || posid_status != 'Warning'
				}

				var po_enabled = this.getView().byId("po_input").getEnabled();
				var po_value = this.getView().byId("po_input").getValue().replace(/\s/g, '');
				var po_status = this.getView().byId("poStatus").getState();
				var po_verified;

				if ((po_enabled && po_value != '') || !po_enabled) {
					po_verified = true;
				} else {
					po_verified = false;
				}

				if (po_enabled) {
					mandatory_verify = mandatory_verify || po_status != 'Warning';
				}

				// ADD ONG BEG
				var glaccount_enabled = this.getView().byId("glaccount_input").getEnabled();
				var glaccount_value = this.getView().byId("glaccount_input").getValue().replace(/\s/g, '');
				var glaccount_status = this.getView().byId("glaccountStatus").getState();
				var glaccount_verified;

				if ((glaccount_enabled && glaccount_value != '') || !glaccount_enabled) {
					glaccount_verified = true;
				} else {
					glaccount_verified = false;
				}

				if (glaccount_enabled) {
					mandatory_verify = mandatory_verify || glaccount_status != 'Warning';
				}
				// ADD ONG END

				var comment_value = this.getView().byId("comment").getValue().replace(/\s/g, '');
				mandatory_verify = mandatory_verify || comment_value != '';

				var ecart_visible = this.getView().byId("ecartRep1").getVisible();
				var ecart_value;
				if (ecart_visible) {
					ecart_value = this.getView().byId("ecartRep").getSelectedItem().getText().replace(/\s/g, '');
				} else {
					ecart_value = '';
				}
				var ecart_verified;

				if ((ecart_visible && ecart_value != '') || !ecart_visible) {
					ecart_verified = true;
				} else {
					ecart_verified = false;
				}
				if (ecart_visible) {
					mandatory_verify = mandatory_verify || ecart_value != ''
				}

				var dp_visible = this.getView().byId("dp_input").getVisible();
				var dp_value = this.getView().byId("dp_input").getValue().replace(/\s/g, '');
				var dp_status = this.getView().byId("dpStatus").getState();
				var dp_verified;

				if ((dp_visible && dp_value != '') || !dp_visible) {
					dp_verified = true;
				} else {
					dp_verified = false;
				}
				if (dp_visible) {
					mandatory_verify = mandatory_verify || dp_status != 'Warning'
				}

				if (posid_verified && po_verified && ecart_verified && dp_verified && comment_value != '') {

					var dialog = new Dialog({
						title: confirmationText,
						type: 'Message',
						content: new Text({
							text: mess1Text
						}),
						beginButton: new Button({
							text: okText,
							press: function () {
								// ONG DEL oThis.submit();
								oThis.submitNew("V");
								dialog.close();
							}
						}),
						endButton: new Button({
							text: cancelText,
							press: function () {
								dialog.close();
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					});

					dialog.open();

				} else if (!mandatory_verify) {

					var dialog = new Dialog({
						title: attentionText,
						type: 'Message',
						state: 'Error',
						content: new Text({
							text: mess2Text
						}),
						beginButton: new Button({
							text: okText,
							press: function () {
								dialog.close();
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					});

					dialog.open();

				} else {

					var dialog = new Dialog({
						title: confirmationText,
						type: 'Message',
						status: 'Warning',
						content: new Text({
							text: mess3Text
						}),
						beginButton: new Button({
							text: okText,
							press: function () {
								// ONG DEL oThis.submit();
								oThis.submitNew("V");
								dialog.close();
							}
						}),
						endButton: new Button({
							text: cancelText,
							press: function () {
								dialog.close();
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					});

					dialog.open();

				}
			} else {}
		},

		// BEGIN ONG ADD 20/01/2020 (+)
		onNavigateToApprove: function (oEvent) {
			var vInvoiceID = this.getInvoiceID();
			this.redirectToApproveRequest(vInvoiceID);
		},

		getInvoiceID: function () {
			return this.objectID; //"D01420190021056152";
		},

		redirectToApproveRequest: function (vInvoiceID) {

			/*update operation*/
			var oModel = this.getOwnerComponent().getModel();
			var oThis = this;
			var oEntry = {};
			oEntry.Zcle = this.objectID;

			if (this.getView().byId("posid_input") != null) {
				var start_pos = this.getView().byId("posid_input").getValue().indexOf('(') + 1;
				var end_pos = this.getView().byId("posid_input").getValue().indexOf(')', start_pos);

				if (start_pos <= 0 || end_pos <= 0) {
					var text_to_get = this.getView().byId("posid_input").getValue();
				} else {
					var text_to_get = this.getView().byId("posid_input").getValue().substring(start_pos, end_pos);
				}

				oEntry.ZzposidInfo = text_to_get;
			}

			if (this.getView().byId("po_input") != null) {
				oEntry.ZzebelnInfo = this.getView().byId("po_input").getValue();

			}

			// ADD ONG BEG
			if (this.getView().byId("glaccount_input") != null) {
				oEntry.zzhkontinfo = this.getView().byId("glaccount_input").getValue();

			}

			if (this.getView().byId("forward_input") != null) {
				oEntry.Destinataireinfob = this.getView().byId("forward_input").getValue();
			}

			oEntry.Zzaction = "S";
			// ADD ONG END

			if (this.getView().byId("ecartRep") != null) {
				oEntry.ZzvalidecartRet = this.getView().byId("ecartRep").getSelectedItem().getText();
			}

			if (this.getView().byId("comment") != null) {
				oEntry.ZzinfoRe = this.getView().byId("comment").getValue();
			}

			if (this.getView().byId("dp_input") != null) {
				oEntry.ZzwrbtrInfo = this.getView().byId("dp_input").getValue();
			}
			// BEGIN ADD ABO 11/06 
			if (this._popUpDisplayed === "X") {
				if (sap.ui.getCore().byId("posid_input2") !== null && sap.ui.getCore().byId("posid_input2") !== "") {
					oEntry.zzaff1 = this.getProjectValue("posid_input2"); //sap.ui.getCore().byId("posid_input2").getValue();
				}
				if (sap.ui.getCore().byId("posid_input3") !== null && sap.ui.getCore().byId("posid_input3") !== "") {
					oEntry.zzaff2 = this.getProjectValue("posid_input3");
				}
				if (sap.ui.getCore().byId("posid_input4") !== null && sap.ui.getCore().byId("posid_input4") !== "") {
					oEntry.zzaff3 = this.getProjectValue("posid_input4");
				}
				if (sap.ui.getCore().byId("posid_input5") !== null && sap.ui.getCore().byId("posid_input5") !== "") {
					oEntry.zzaff4 = this.getProjectValue("posid_input5");
				}
				if (sap.ui.getCore().byId("posid_input6") !== null && sap.ui.getCore().byId("posid_input6") !== "") {
					oEntry.zzaff5 = this.getProjectValue("posid_input6");
				}
				if (sap.ui.getCore().byId("posid_input7") !== null && sap.ui.getCore().byId("posid_input7") !== "") {
					oEntry.zzaff6 = this.getProjectValue("posid_input7");
				}
				if (this.getView().byId("posid_input8") !== null && sap.ui.getCore().byId("posid_input8") !== "") {
					oEntry.zzaff7 = this.getProjectValue("posid_input8");
				}
				if (sap.ui.getCore().byId("posid_input9") !== null && sap.ui.getCore().byId("posid_input9") !== "") {
					oEntry.zzaff8 = this.getProjectValue("posid_input9");
				}
				if (sap.ui.getCore().byId("posid_input10") !== null && sap.ui.getCore().byId("posid_input10") !== "") {
					oEntry.zzaff9 = this.getProjectValue("posid_input10");
				}
				if (sap.ui.getCore().byId("mt_input1") !== null && sap.ui.getCore().byId("mt_input1") !== "") {
					oEntry.zzwrbtr2 = sap.ui.getCore().byId("mt_input1").getValue();
				}
				if (sap.ui.getCore().byId("mt_input2").getValue() !== null && sap.ui.getCore().byId("mt_input2").getValue() !== "") {
					oEntry.zzmt1 = sap.ui.getCore().byId("mt_input2").getValue();
				} else {
					oEntry.zzmt1 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input3").getValue() !== null && sap.ui.getCore().byId("mt_input3").getValue() !== "") {
					oEntry.zzmt2 = sap.ui.getCore().byId("mt_input3").getValue();
				} else {
					oEntry.zzmt2 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input4").getValue() !== null && sap.ui.getCore().byId("mt_input4").getValue() !== "") {
					oEntry.zzmt3 = sap.ui.getCore().byId("mt_input4").getValue();
				} else {
					oEntry.zzmt3 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input5").getValue() !== null && sap.ui.getCore().byId("mt_input5").getValue() !== "") {
					oEntry.zzmt4 = sap.ui.getCore().byId("mt_input5").getValue();
				} else {
					oEntry.zzmt4 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input6").getValue() !== null && sap.ui.getCore().byId("mt_input6").getValue() !== "") {
					oEntry.zzmt5 = sap.ui.getCore().byId("mt_input6").getValue();
				} else {
					oEntry.zzmt5 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input7").getValue() !== null && sap.ui.getCore().byId("mt_input7").getValue() !== "") {
					oEntry.zzmt6 = sap.ui.getCore().byId("mt_input7").getValue();
				} else {
					oEntry.zzmt6 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input8").getValue() !== null && sap.ui.getCore().byId("mt_input8").getValue() !== "") {
					oEntry.zzmt7 = sap.ui.getCore().byId("mt_input8").getValue();
				} else {
					oEntry.zzmt7 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input9").getValue() !== null && sap.ui.getCore().byId("mt_input9").getValue() !== "") {
					oEntry.zzmt8 = sap.ui.getCore().byId("mt_input9").getValue();
				} else {
					oEntry.zzmt8 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input10").getValue() !== null && sap.ui.getCore().byId("mt_input10").getValue() !== "") {
					oEntry.zzmt9 = sap.ui.getCore().byId("mt_input10").getValue();
				} else {
					oEntry.zzmt9 = "0.00";
				}
			}
			
			// END ADD ABO 11/06 
			oModel.update("/DetailSet('" + oEntry.Zcle + "')", oEntry,

				{
					// method: "PUT",
					success: function (data, response) {
						// ONG ADD 04/06/2019
						// response header
						var hdrMessage = response.headers["sap-message"];
						if (hdrMessage !== null && hdrMessage !== "" && hdrMessage !== undefined && hdrMessage.length > 1) {
							var hdrMessageObject = JSON.parse(hdrMessage);
							sap.m.MessageBox.show(hdrMessageObject.message, sap.m.MessageBox.Icon.ERROR);

						} else {
							oModel.refresh(true);
							oThis.switchToApprove(vInvoiceID);
						}

						// ONG ADD 04/06/2019

					},
					error: function (e) {

						oThis.oError = true;
					}
				}
			);
		},

		switchToApprove: function (vInvoiceID) {
			var sParams;
			var url;

			// get a handle on the global XAppNav service
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.isIntentSupported(["ZAPPROVESI-zdisplay"])
				.done(function (aResponses) {})
				.fail(function () {
					new sap.m.MessageToast("Provide corresponding intent to navigate");
				});

			// generate the Hash to display a employee Id
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "ZAPPROVESI",
					action: "zdisplay"
				}
			})) || "";

			if (vInvoiceID !== "" && vInvoiceID !== undefined) {
				// Get Url Parametres List
				sParams = '&/Master/' + vInvoiceID;

				//Generate a  URL for the second application
				url = window.location.href.split('#')[0] + hash + sParams;
			} else {
				//Generate a  URL for the second application
				url = window.location.href.split('#')[0] + hash;
			}

			//Navigate to second app
			window.open(url, "_self");
		},
		// BEGIN ONG ADD 20/01/2020 (+)

		// ONG ADD Forward To (+)
		displayProjectPopup: function () {
			this._popUpDisplayed = "X";
			this._getDialogProject().open();

			var affMain = this.getView().byId("posid_input").getValue();
			sap.ui.getCore().byId("posid_input1").setValue(affMain);
			this._changeMasterItem = "";
			//this.submitNew("F");
		},

		_getDialogProject: function () {
			// create a fragment with dialog, and pass the selected data
			if (!this.dialogProject) {
				//var oModel = this.getOwnerComponent().getModel();
				//this.getView().setModel(oModel, "ModelProjectElement");
				// This fragment can be instantiated from a controller as follows:
				this.dialogProject = sap.ui.xmlfragment("vesi.fi.rfi.yfi_dfi_rfi.fragment.project", this);
				//debugger;
				this.getView().addDependent(this.dialogProject);
			}
			//debugger;
			return this.dialogProject;
		},

		closeDialogProject: function () {
			this._getDialogProject().close();
		},

		forward: function () {
			this.submitNew("F");
		},

		getProjectValue: function (sFieldId) {

			var sProjectId = "";
			if (sap.ui.getCore().byId(sFieldId) !== null) {
				var start_pos = sap.ui.getCore().byId(sFieldId).getValue().indexOf('(') + 1;
				var end_pos = sap.ui.getCore().byId(sFieldId).getValue().indexOf(')', start_pos);

				if (start_pos <= 0 || end_pos <= 0) {
					sProjectId = sap.ui.getCore().byId(sFieldId).getValue();
				} else {
					sProjectId = sap.ui.getCore().byId(sFieldId).getValue().substring(start_pos, end_pos);
				}
			}

			return sProjectId;
		},

		submitNew: function (sActionField) {
			/*update operation*/
			var oModel = this.getOwnerComponent().getModel();
			var oThis = this;
			var oEntry = {};
			oEntry.Zcle = this.objectID;

			if (this.getView().byId("posid_input") != null) {
				var start_pos = this.getView().byId("posid_input").getValue().indexOf('(') + 1;
				var end_pos = this.getView().byId("posid_input").getValue().indexOf(')', start_pos);

				if (start_pos <= 0 || end_pos <= 0) {
					var text_to_get = this.getView().byId("posid_input").getValue();
				} else {
					var text_to_get = this.getView().byId("posid_input").getValue().substring(start_pos, end_pos);
				}

				oEntry.ZzposidInfo = text_to_get;
			}

			if (this.getView().byId("po_input") != null) {
				oEntry.ZzebelnInfo = this.getView().byId("po_input").getValue();

			}

			// ADD ONG BEG
			if (this.getView().byId("glaccount_input") != null) {
				oEntry.zzhkontinfo = this.getView().byId("glaccount_input").getValue();

			}

			if (this.getView().byId("forward_input") != null) {
				oEntry.Destinataireinfob = this.getView().byId("forward_input").getValue();
			}

			oEntry.Zzaction = sActionField;
			// ADD ONG END

			if (this.getView().byId("ecartRep") != null) {
				oEntry.ZzvalidecartRet = this.getView().byId("ecartRep").getSelectedItem().getText();
			}

			if (this.getView().byId("comment") != null) {
				oEntry.ZzinfoRe = this.getView().byId("comment").getValue();
			}

			if (this.getView().byId("dp_input") != null) {
				oEntry.ZzwrbtrInfo = this.getView().byId("dp_input").getValue();
			}
			// BEGIN ADD ABO 11/06 
			if (this._popUpDisplayed === "X") {
				if (sap.ui.getCore().byId("posid_input2") !== null && sap.ui.getCore().byId("posid_input2") !== "") {
					oEntry.zzaff1 = this.getProjectValue("posid_input2"); //sap.ui.getCore().byId("posid_input2").getValue();
				}
				if (sap.ui.getCore().byId("posid_input3") !== null && sap.ui.getCore().byId("posid_input3") !== "") {
					oEntry.zzaff2 = this.getProjectValue("posid_input3");
				}
				if (sap.ui.getCore().byId("posid_input4") !== null && sap.ui.getCore().byId("posid_input4") !== "") {
					oEntry.zzaff3 = this.getProjectValue("posid_input4");
				}
				if (sap.ui.getCore().byId("posid_input5") !== null && sap.ui.getCore().byId("posid_input5") !== "") {
					oEntry.zzaff4 = this.getProjectValue("posid_input5");
				}
				if (sap.ui.getCore().byId("posid_input6") !== null && sap.ui.getCore().byId("posid_input6") !== "") {
					oEntry.zzaff5 = this.getProjectValue("posid_input6");
				}
				if (sap.ui.getCore().byId("posid_input7") !== null && sap.ui.getCore().byId("posid_input7") !== "") {
					oEntry.zzaff6 = this.getProjectValue("posid_input7");
				}
				if (this.getView().byId("posid_input8") !== null && sap.ui.getCore().byId("posid_input8") !== "") {
					oEntry.zzaff7 = this.getProjectValue("posid_input8");
				}
				if (sap.ui.getCore().byId("posid_input9") !== null && sap.ui.getCore().byId("posid_input9") !== "") {
					oEntry.zzaff8 = this.getProjectValue("posid_input9");
				}
				if (sap.ui.getCore().byId("posid_input10") !== null && sap.ui.getCore().byId("posid_input10") !== "") {
					oEntry.zzaff9 = this.getProjectValue("posid_input10");
				}
				if (sap.ui.getCore().byId("mt_input1") !== null && sap.ui.getCore().byId("mt_input1") !== "") {
					oEntry.zzwrbtr2 = sap.ui.getCore().byId("mt_input1").getValue();
				}
				if (sap.ui.getCore().byId("mt_input2").getValue() !== null && sap.ui.getCore().byId("mt_input2").getValue() !== "") {
					oEntry.zzmt1 = sap.ui.getCore().byId("mt_input2").getValue();
				} else {
					oEntry.zzmt1 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input3").getValue() !== null && sap.ui.getCore().byId("mt_input3").getValue() !== "") {
					oEntry.zzmt2 = sap.ui.getCore().byId("mt_input3").getValue();
				} else {
					oEntry.zzmt2 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input4").getValue() !== null && sap.ui.getCore().byId("mt_input4").getValue() !== "") {
					oEntry.zzmt3 = sap.ui.getCore().byId("mt_input4").getValue();
				} else {
					oEntry.zzmt3 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input5").getValue() !== null && sap.ui.getCore().byId("mt_input5").getValue() !== "") {
					oEntry.zzmt4 = sap.ui.getCore().byId("mt_input5").getValue();
				} else {
					oEntry.zzmt4 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input6").getValue() !== null && sap.ui.getCore().byId("mt_input6").getValue() !== "") {
					oEntry.zzmt5 = sap.ui.getCore().byId("mt_input6").getValue();
				} else {
					oEntry.zzmt5 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input7").getValue() !== null && sap.ui.getCore().byId("mt_input7").getValue() !== "") {
					oEntry.zzmt6 = sap.ui.getCore().byId("mt_input7").getValue();
				} else {
					oEntry.zzmt6 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input8").getValue() !== null && sap.ui.getCore().byId("mt_input8").getValue() !== "") {
					oEntry.zzmt7 = sap.ui.getCore().byId("mt_input8").getValue();
				} else {
					oEntry.zzmt7 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input9").getValue() !== null && sap.ui.getCore().byId("mt_input9").getValue() !== "") {
					oEntry.zzmt8 = sap.ui.getCore().byId("mt_input9").getValue();
				} else {
					oEntry.zzmt8 = "0.00";
				}
				if (sap.ui.getCore().byId("mt_input10").getValue() !== null && sap.ui.getCore().byId("mt_input10").getValue() !== "") {
					oEntry.zzmt9 = sap.ui.getCore().byId("mt_input10").getValue();
				} else {
					oEntry.zzmt9 = "0.00";
				}
			}
			// END ADD ABO 11/06 
			oModel.update("/DetailSet('" + oEntry.Zcle + "')", oEntry,

				{
					// method: "PUT",
					success: function (data, response) {

						// var SuccessText = oThis.getView().getModel("i18n").getResourceBundle().getText("successText");
						// var SuccessTitle = oThis.getView().getModel("i18n").getResourceBundle().getText("successTitle");

						// sap.m.MessageBox.show(SuccessText, sap.m.MessageBox.Icon.SUCCESS, SuccessTitle);

						// ONG ADD 04/06/2019
						// response header
						var hdrMessage = response.headers["sap-message"];
						if (hdrMessage !== null && hdrMessage !== "" && hdrMessage !== undefined && hdrMessage.length > 1) {
							var hdrMessageObject = JSON.parse(hdrMessage);
							sap.m.MessageBox.show(hdrMessageObject.message, sap.m.MessageBox.Icon.ERROR);

						} else {
							oModel.refresh(true);

							var eventBus = sap.ui.getCore().getEventBus();
							eventBus.publish("Detail", "selectFirstItemAfter");
						}

						// ONG ADD 04/06/2019
						/*						oModel.refresh(true);

												var eventBus = sap.ui.getCore().getEventBus();
												eventBus.publish("Detail", "selectFirstItemAfter");*/

					},
					error: function (e) {

						oThis.oError = true;
						// ONG ADD 04/06/2019 (+)
						/*						var oModelValue = JSON.parse(e.responseText);
												var sMessageError = oModelValue.error.innererror.errordetails[0].message;
												sap.m.MessageBox.show(sMessageError);*/
						// ONG ADD 04/06/2019 (+)
						// 			var eventBus = sap.ui.getCore().getEventBus();

						// eventBus.publish("Detail", "stopError");

						// sap.m.MessageBox.show('tt', sap.m.MessageBox.Icon.SUCCESS, 'rr');
						// oModel.refresh(true);
						// oThis.formatData();
					}
				}
			);
		},
		// ONG ADD Forward To (+)

		submit: function () {

			/*update operation*/
			var oModel = this.getOwnerComponent().getModel();
			var oThis = this;
			var oEntry = {};
			oEntry.Zcle = this.objectID;

			if (this.getView().byId("posid_input") != null) {
				var start_pos = this.getView().byId("posid_input").getValue().indexOf('(') + 1;
				var end_pos = this.getView().byId("posid_input").getValue().indexOf(')', start_pos);

				if (start_pos <= 0 || end_pos <= 0) {
					var text_to_get = this.getView().byId("posid_input").getValue();
				} else {
					var text_to_get = this.getView().byId("posid_input").getValue().substring(start_pos, end_pos);
				}

				oEntry.ZzposidInfo = text_to_get;
			}

			if (this.getView().byId("po_input") != null) {
				oEntry.ZzebelnInfo = this.getView().byId("po_input").getValue();

			}

			// ADD ONG BEG
			if (this.getView().byId("glaccount_input") != null) {
				oEntry.zzhkontinfo = this.getView().byId("glaccount_input").getValue();

			}

			if (this.getView().byId("forward_input") != null) {
				oEntry.Destinataireinfob = this.getView().byId("forward_input").getValue();
			}
			// ADD ONG END

			if (this.getView().byId("ecartRep") != null) {
				oEntry.ZzvalidecartRet = this.getView().byId("ecartRep").getSelectedItem().getText();
			}

			if (this.getView().byId("comment") != null) {
				oEntry.ZzinfoRe = this.getView().byId("comment").getValue();
			}

			if (this.getView().byId("dp_input") != null) {
				oEntry.ZzwrbtrInfo = this.getView().byId("dp_input").getValue();
			}

			oModel.update("/DetailSet('" + oEntry.Zcle + "')", oEntry,

				{
					// method: "PUT",
					success: function (data, response) {

						// var SuccessText = oThis.getView().getModel("i18n").getResourceBundle().getText("successText");
						// var SuccessTitle = oThis.getView().getModel("i18n").getResourceBundle().getText("successTitle");

						// sap.m.MessageBox.show(SuccessText, sap.m.MessageBox.Icon.SUCCESS, SuccessTitle);

						// ONG ADD 04/06/2019
						// response header
						var hdrMessage = response.headers["sap-message"];
						if (hdrMessage !== null && hdrMessage !== "" && hdrMessage.length > 1) {
							var hdrMessageObject = JSON.parse(hdrMessage);
							sap.m.MessageBox.show(hdrMessageObject.message, sap.m.MessageBox.Icon.ERROR);

						} else {
							oModel.refresh(true);

							var eventBus = sap.ui.getCore().getEventBus();
							eventBus.publish("Detail", "selectFirstItemAfter");
						}

						// ONG ADD 04/06/2019
						/*						oModel.refresh(true);

												var eventBus = sap.ui.getCore().getEventBus();
												eventBus.publish("Detail", "selectFirstItemAfter");*/

					},
					error: function (e) {

						oThis.oError = true;
						// ONG ADD 04/06/2019 (+)
						/*						var oModelValue = JSON.parse(e.responseText);
												var sMessageError = oModelValue.error.innererror.errordetails[0].message;
												sap.m.MessageBox.show(sMessageError);*/
						// ONG ADD 04/06/2019 (+)
						// 			var eventBus = sap.ui.getCore().getEventBus();

						// eventBus.publish("Detail", "stopError");

						// sap.m.MessageBox.show('tt', sap.m.MessageBox.Icon.SUCCESS, 'rr');
						// oModel.refresh(true);
						// oThis.formatData();
					}
				}
			);
		},

		// refuse: function() {

		// 	var oEntry = {};
		// 	oEntry.Zcle = this.objectID;
		// 	oEntry.ZzinfoRe = "**PIGEREAL**";
		// 	var oModel = this.getOwnerComponent().getModel();
		// 	var oThis = this;

		// 		oModel.update("/DetailSet('" + oEntry.Zcle + "')", oEntry,

		// 			{
		// 				// method: "PUT",
		// 				success: function(data) {
		// 					oModel.refresh(true);

		// 					var eventBus = sap.ui.getCore().getEventBus();
		// 					eventBus.publish("Detail", "selectFirstItemAfter");
		// 				},
		// 				error: function(e) {
		// 					oThis.oError = true;
		// 				}
		// 			}
		// 		);

		// },

		commentChange: function () {

			var comment = this.getView().byId("comment").getValue();
			comment = comment.replace(/\s+/g, '');

			if (comment != "") {
				this.getView().byId("commentStatus").setIcon("sap-icon://accept");
				this.getView().byId("commentStatus").setState("Success");
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("completed");
				this.getView().byId("commentStatus").setText(txt);

			} else {
				this.getView().byId("commentStatus").setIcon("sap-icon://message-warning");
				this.getView().byId("commentStatus").setState("Warning");
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("pending");
				this.getView().byId("commentStatus").setText(txt);

			}

		},

		reject: function () {
			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);
			this.formatData();

			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("Detail", "refreshList");
		},

		posidChange: function () {

			var posid = this.getView().byId("posid_input").getValue();
			posid = posid.replace(/\s+/g, '');

			if (posid != "") {
				this.getView().byId("posidStatus").setIcon("sap-icon://accept");
				this.getView().byId("posidStatus").setState("Success");
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("completed");
				this.getView().byId("posidStatus").setText(txt);

			} else {
				this.getView().byId("posidStatus").setIcon("sap-icon://message-warning");
				this.getView().byId("posidStatus").setState("Warning");
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("pending");
				this.getView().byId("posidStatus").setText(txt);

			}

		},
		poChange: function () {

			var po = this.getView().byId("po_input").getValue();
			po = po.replace(/\s+/g, '');

			if (po != "") {
				this.getView().byId("poStatus").setIcon("sap-icon://accept");
				this.getView().byId("poStatus").setState("Success");
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("completed");
				this.getView().byId("poStatus").setText(txt);

			} else {
				this.getView().byId("poStatus").setIcon("sap-icon://message-warning");
				this.getView().byId("poStatus").setState("Warning");
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("pending");
				this.getView().byId("poStatus").setText(txt);

			}

		},

		// ADD ONG BEG
		glAccountChange: function () {
			var po = this.getView().byId("glaccount_input").getValue();
			po = po.replace(/\s+/g, '');

			if (po != "") {
				this.getView().byId("glaccountStatus").setIcon("sap-icon://accept");
				this.getView().byId("glaccountStatus").setState("Success");
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("completed");
				this.getView().byId("glaccountStatus").setText(txt);

			} else {
				this.getView().byId("glaccountStatus").setIcon("sap-icon://message-warning");
				this.getView().byId("glaccountStatus").setState("Warning");
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("pending");
				this.getView().byId("glaccountStatus").setText(txt);

			}
		},
		// ADD ONG END

		ecartChange: function () {

			var answer = this.getView().byId("ecartRep").getSelectedItem().getText();

			if (answer != "") {
				this.getView().byId("ecartStatus").setIcon("sap-icon://accept");
				this.getView().byId("ecartStatus").setState("Success");
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("completed");
				this.getView().byId("ecartStatus").setText(txt);

			} else {
				this.getView().byId("ecartStatus").setIcon("sap-icon://message-warning");
				this.getView().byId("ecartStatus").setState("Warning");
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("pending");
				this.getView().byId("ecartStatus").setText(txt);

			}

		},

		dpChange: function () {

			var dp = this.getView().byId("dp_input").getValue();
			if (isNaN(dp)) {
				this.getView().byId("dp_input").setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("dpStatus").setIcon("sap-icon://message-warning");
				this.getView().byId("dpStatus").setState("Warning");
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("pending");
				this.getView().byId("dpStatus").setText(txt);

			} else {
				this.getView().byId("dp_input").setValueState(sap.ui.core.ValueState.None);
				if (dp != "") {
					this.getView().byId("dpStatus").setIcon("sap-icon://accept");
					this.getView().byId("dpStatus").setState("Success");
					var txt = this.getView().getModel("i18n").getResourceBundle().getText("completed");
					this.getView().byId("dpStatus").setText(txt);

				}
			}
		},

		myFormatter: function (value) {

			if (value != null) {
				// var str = this.byId("miscInfo").getValue();
				var newline = String.fromCharCode(13, 10);
				value = this.ReplaceAll(value, "//", newline.toString());
				// this.byId("miscInfo").setValue(str);

				return value;

			}
		},

		onDpChange: function () {

			var dp = this.getView().byId("dp_input").getValue();
			if (isNaN(dp)) {
				this.getView().byId("dp_input").setValueState(sap.ui.core.ValueState.Error);
			} else {
				this.getView().byId("dp_input").setValueState(sap.ui.core.ValueState.None);

			}
		},

		updateStatus: function () {

			// var due_date = this.getView().byId("due_date_text").getText();
			// var due_date = this.getView().byId("due_date_text").getBindingContext().getProperty("Zzdate");

			var posidStatus = this.getView().byId("posidStatus");
			var posidInput = this.getView().byId("posid_input");

			var poStatus = this.getView().byId("poStatus");
			var poInput = this.getView().byId("po_input");

			// ADD ONG BEG
			var glaccountStatus = this.getView().byId("glaccountStatus");
			var glaccountInput = this.getView().byId("glaccount_input");
			var forwardInput = this.getView().byId("forward_input");
			forwardInput.setValue("");
			// ADD ONG END

			var posidStatusCh = this.getView().byId("formdetails").getBindingContext().getProperty("ZzposidCh");
			var ZzposidInfo = this.getView().byId("formdetails").getBindingContext().getProperty("ZzposidInfo");

			var ZzposidInfoDecription = this.getView().byId("formdetails").getBindingContext().getProperty("post1");

			var poStatusCh = this.getView().byId("formdetails").getBindingContext().getProperty("ZzebelnCh");
			var ZzpoInfo = this.getView().byId("formdetails").getBindingContext().getProperty("ZzebelnInfo");

			// ADD ONG BEG
			var glaccountStatusCh = this.getView().byId("formdetails").getBindingContext().getProperty("zzhkontCh");
			var glaccountInfo = this.getView().byId("formdetails").getBindingContext().getProperty("zzhkontinfo");
			// ADD ONG END

			var txtPending = this.getView().getModel("i18n").getResourceBundle().getText("pending");
			var txtnotReq = this.getView().getModel("i18n").getResourceBundle().getText("not_req");

			if (posidStatusCh) {

				posidStatus.setState("Warning");
				posidStatus.setIcon("sap-icon://message-warning");
				posidStatus.setText(txtPending);
				if (ZzposidInfo != '') {
					// posidInput.setValue(ZzposidInfoDecription + " (" + ZzposidInfo + ")"); ONG DEL
					posidInput.setValue(ZzposidInfo);
				} else {
					posidInput.setValue("");
				}
			} else {

				posidStatus.setState("None");
				posidStatus.setIcon("sap-icon://hint");
				posidStatus.setText(txtnotReq);
				// posidInput.setValue(ZzposidInfo);
				if (ZzposidInfo != '') {
					// posidInput.setValue(ZzposidInfoDecription + " (" + ZzposidInfo + ")"); ONG DEL
					posidInput.setValue(ZzposidInfo);

					var start_pos = this.getView().byId("posid_input").getValue().indexOf('(') + 1;
					var end_pos = this.getView().byId("posid_input").getValue().indexOf(')', start_pos);
					var text_to_get = this.getView().byId("posid_input").getValue().substring(start_pos, end_pos)

				} else {
					posidInput.setValue("");
				}
			}

			if (poStatusCh) {

				poStatus.setState("Warning");
				poStatus.setIcon("sap-icon://message-warning");
				poStatus.setText(txtPending);
				poInput.setValue(ZzpoInfo);

			} else {

				poStatus.setState("None");
				poStatus.setIcon("sap-icon://hint");
				poStatus.setText(txtnotReq);
				poInput.setValue(ZzpoInfo);

			}

			// ADD ONG BEG
			if (glaccountStatusCh) {
				glaccountStatus.setState("Warning");
				glaccountStatus.setIcon("sap-icon://message-warning");
				glaccountStatus.setText(txtPending);
				glaccountInput.setValue(glaccountInfo);

			} else {

				glaccountStatus.setState("None");
				glaccountStatus.setIcon("sap-icon://hint");
				glaccountStatus.setText(txtnotReq);
				glaccountInput.setValue(glaccountInfo);
			}
			// ADD ONG END

		},

		// ADD ONG BEGIN 
		handleDestinataireValueHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			// create value help dialog
			if (!this._valueHelpDialogDest) {
				this._valueHelpDialogDest = sap.ui.xmlfragment(
					"vesi.fi.rfi.yfi_dfi_rfi.fragment.DestinataireVH",
					this
				);
				this.getView().addDependent(this._valueHelpDialogDest);
			}

			var aSearch;

			if (sInputValue !== "") {
				aSearch = [new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("usrid", sap.ui.model.FilterOperator.Contains, sInputValue),
						new sap.ui.model.Filter("sname", sap.ui.model.FilterOperator.Contains, sInputValue),
						new sap.ui.model.Filter("pernr", sap.ui.model.FilterOperator.Contains, sInputValue)
					],
					or: true
				})];
			} else {
				aSearch = [];
			}

			this._valueHelpDialogDest.getBinding("items").filter(aSearch);
			// open value help dialog filtered by the input value
			this._valueHelpDialogDest.open(sInputValue);
		},

		_handleDestValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var aSearch;

			aSearch = [new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("usrid", sap.ui.model.FilterOperator.Contains, sValue),
					new sap.ui.model.Filter("sname", sap.ui.model.FilterOperator.Contains, sValue),
					new sap.ui.model.Filter("pernr", sap.ui.model.FilterOperator.Contains, sValue)
				],
				and: true
			})];

			evt.getSource().getBinding("items").filter(aSearch);
		},

		_handleDestValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var forwardInput = this.getView().byId("forward_input"); //sap.ui.getCore().byId("forward_input");
				forwardInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},
		// ADD ONG END

		handlePosidValueHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog1) {
				this._valueHelpDialog1 = sap.ui.xmlfragment(
					"vesi.fi.rfi.yfi_dfi_rfi.view.ProjectHelpFragment",
					this
				);
				this.getView().addDependent(this._valueHelpDialog1);

			}

			var aSearch;

			if (sInputValue != '') {

				aSearch = [new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("ZzposidInfo", sap.ui.model.FilterOperator.EQ, this.objectID),
						new sap.ui.model.Filter("Postu", sap.ui.model.FilterOperator.Contains, sInputValue)

					],
					and: true
				})];
			} else {

				aSearch = [new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("ZzposidInfo", sap.ui.model.FilterOperator.EQ, this.objectID)

					],
					and: true
				})];

			}

			// create a filter for the binding
			// this._valueHelpDialog1.getBinding("items").filter([new sap.ui.model.Filter(
			// 	"ZzposidInfo",
			// 	sap.ui.model.FilterOperator.Contains, sInputValue
			// )]);

			this._valueHelpDialog1.getBinding("items").filter(aSearch);
			// open value help dialog filtered by the input value
			this._valueHelpDialog1.open(sInputValue);
		},

		handlePoValueHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog2) {
				this._valueHelpDialog2 = sap.ui.xmlfragment(
					"vesi.fi.rfi.yfi_dfi_rfi.view.CommandeHelpFragment",
					this
				);
				this.getView().addDependent(this._valueHelpDialog2);

			}

			var aSearch;

			if (sInputValue != '') {
				// create a filter for the binding
				aSearch = [new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Ebelp", sap.ui.model.FilterOperator.EQ, this.objectID),
						new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.Contains, sInputValue)

					],
					and: true
				})];
			} else {

				aSearch = [new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, this.objectID)

					],
					and: true
				})];
			}

			// // var aFilters = aSearch.concat(this._oListFilterState.aFilter),
			this._valueHelpDialog2.getBinding("items").filter(aSearch);

			// open value help dialog filtered by the input value
			this._valueHelpDialog2.open(sInputValue);
		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			// var oFilter = new sap.ui.model.Filter(
			// 	"ZzposidInfo",
			// 	sap.ui.model.FilterOperator.Contains, sValue
			// );

			var aSearch;

			aSearch = [new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("ZzposidInfo", sap.ui.model.FilterOperator.EQ, this.objectID),
					new sap.ui.model.Filter("Postu", sap.ui.model.FilterOperator.Contains, sValue)

				],
				and: true
			})];

			// evt.getSource().getBinding("items").filter([oFilter]);
			evt.getSource().getBinding("items").filter(aSearch);

		},

		_handleValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = sap.ui.getCore().byId(this.inputId); //this.getView().byId(this.inputId); ONG DEL
				// productInput.setValue(oSelectedItem.getDescription() + " (" + oSelectedItem.getTitle() + ")"); ONG DEL
				productInput.setValue(oSelectedItem.getTitle());

				this.getView().byId("posidStatus").setIcon("sap-icon://accept");
				this.getView().byId("posidStatus").setState("Success");
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("completed");
				this.getView().byId("posidStatus").setText(txt);

			}
			evt.getSource().getBinding("items").filter([]);
		},

		handleSearchPO: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var aSearch = [new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("Ebelp", sap.ui.model.FilterOperator.EQ, this.objectID),
					new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.Contains, sValue)

				],
				and: true
			})];
			this._valueHelpDialog2.getBinding("items").filter(aSearch);
		},

		handleClosePO: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts && aContexts.length) {
				var productInput = sap.ui.getCore().byId(this.inputId); //this.getView().byId(this.inputId); ONG DEL
				productInput.setValue(aContexts.map(function (oContext) {
					return oContext.getObject().Ebeln;
				}));

				this.getView().byId("poStatus").setIcon("sap-icon://accept");
				this.getView().byId("poStatus").setState("Success");
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("completed");
				this.getView().byId("poStatus").setText(txt);

			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		statusDueDate: function (value) {

			if (value !== null) {
				var currentTime = new Date();
				var date = new Date(value);
				var timeDiff = date.getTime() - currentTime.getTime();
				var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
			} else {
				diffDays = 10;
			}

			if (diffDays < 8) {
				this.getView().byId("due_date_text").addStyleClass("alert"); // console.log (cellId);

			} else {
				this.getView().byId("due_date_text").removeStyleClass("alert"); // console.log (cellId);

			}
			return value;
		},

		displayPDF: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			var sMediaSrc = oContext.getProperty().__metadata.uri + "/$value";
			sMediaSrc = sMediaSrc.replace("Liste", "Attachment");

			var oLink = document.createElement("a");
			oLink.href = sMediaSrc;
			var sUrl = (oLink.pathname.charAt(0) === "/") ? oLink.pathname : "/" + oLink.pathname; //InternetExplorer needs a "/" at the beginning

			// console.log(sMediaSrc);
			// window.open("/sap/opu/odata/sap/YFI_DIGIT_SRV/DetailSet(‘"+ 2222 +"‘)/$value");

			if (sap.ui.Device.system.phone || sap.ui.Device.system.tablet) {
				sap.m.URLHelper.redirect(sUrl, true);
			} else {
				sap.m.URLHelper.redirect(sUrl, true);
			}

		},

		handleNavButtonPress: function () {
			// var oSplitApp = this.getView().getParent().getParent();
			// var oMaster = oSplitApp.getMasterPages()[0];
			// // oSplitApp.toMaster(oMaster, "flip");
			// oSplitApp.toMaster(oMaster);
			this.getRouter().navTo("master", {}, true);

		},
		handleSuggestPN: function (oEvent) {

			var sTerm = oEvent.getParameter("suggestValue");

			var aFilters = [new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("ZzposidInfo", sap.ui.model.FilterOperator.EQ, this.objectID),
					new sap.ui.model.Filter("Postu", sap.ui.model.FilterOperator.Contains, sTerm)

				],
				and: true
			})];

			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);

			var pnInput = oEvent.getSource();

			pnInput.setShowSuggestion(true);
			pnInput.setFilterSuggests(false);
			pnInput.removeAllSuggestionItems();

		}

	});

});