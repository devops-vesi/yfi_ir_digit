/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 ListeSet in the list
// * All 3 ListeSet have at least one Detail

sap.ui.require([
	"sap/ui/test/Opa5",
	"vesi/fi/rfi/yfi_dfi_rfi/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"vesi/fi/rfi/yfi_dfi_rfi/test/integration/pages/App",
	"vesi/fi/rfi/yfi_dfi_rfi/test/integration/pages/Browser",
	"vesi/fi/rfi/yfi_dfi_rfi/test/integration/pages/Master",
	"vesi/fi/rfi/yfi_dfi_rfi/test/integration/pages/Detail",
	"vesi/fi/rfi/yfi_dfi_rfi/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "vesi.fi.rfi.yfi_dfi_rfi.view."
	});

	sap.ui.require([
		"vesi/fi/rfi/yfi_dfi_rfi/test/integration/MasterJourney",
		"vesi/fi/rfi/yfi_dfi_rfi/test/integration/NavigationJourney",
		"vesi/fi/rfi/yfi_dfi_rfi/test/integration/NotFoundJourney",
		"vesi/fi/rfi/yfi_dfi_rfi/test/integration/BusyJourney",
		"vesi/fi/rfi/yfi_dfi_rfi/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});