/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"vesi/fi/rfi/yfi_dfi_rfi/test/integration/NavigationJourneyPhone",
		"vesi/fi/rfi/yfi_dfi_rfi/test/integration/NotFoundJourneyPhone",
		"vesi/fi/rfi/yfi_dfi_rfi/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});