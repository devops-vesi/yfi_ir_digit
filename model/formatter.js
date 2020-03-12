sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function (sValue) {

			if (!sValue) {
				return "";
			}

			return (parseFloat(sValue).toFixed(2));
		},

		// ONG ADD 10/06/2019
		formatRefTitle: function (vTypeDocument) {
			var sText;
			switch (vTypeDocument) {
			case "A":
				sText = this.getView().getModel("i18n").getResourceBundle().getText("avoir");
				break;
			case "F":
				sText = this.getView().getModel("i18n").getResourceBundle().getText("invoice");
				break;
			default:
				sText = this.getView().getModel("i18n").getResourceBundle().getText("invoice");
			}
			return sText;
		},
		
		formatDateTitle: function (vTypeDocument) {
			var sText;
			switch (vTypeDocument) {
			case "A":
				sText = this.getView().getModel("i18n").getResourceBundle().getText("avoir_date");
				break;
			case "F":
				sText = this.getView().getModel("i18n").getResourceBundle().getText("inv_date");
				break;
			default:
				sText = this.getView().getModel("i18n").getResourceBundle().getText("inv_date");
			}
			return sText;
		},		
		// ONG ADD 10/06/2019

		waersValue: function (sValue) {

			var ttc = this.getView().getModel("i18n").getResourceBundle().getText("ttc");

			if (!sValue) {
				return "";
			}

			return (sValue + " " + ttc);
		}
	};

});