/* eslint-disable no-console */
import Controller from "sap/fe/core/PageController";
import Select from "sap/m/Select";
import MessageToast from "sap/m/MessageToast";
import Item from "sap/ui/core/Item";
import Image from "sap/m/Image";
import Table from "sap/m/Table";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Context from "sap/ui/model/odata/v4/Context";
import MessageBox from "sap/m/MessageBox";
import ODataContextBinding from "sap/ui/model/odata/v4/ODataContextBinding";
import GridContainerItemLayoutData from "sap/f/GridContainerItemLayoutData";
import GridContainer from "sap/f/GridContainer";

/**
 * @namespace raceanalysis.ext.view
 */
export default class SessionObjectPage extends Controller {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf raceanalysis.ext.view.SessionObjectPage
     */
    public onInit(): void {
        super.onInit();

        this.onGenerateMetricsPress();
        // this.loadLapData();
    }

    private async loadLapData(): Promise<void> {
        const lapSelect = this.byId("lapSelect") as Select;
        const lapsTimesLayout = this.byId("lapTimesLayout") as GridContainerItemLayoutData;
        const speedPerLapLayout = this.byId("speedPerLapLayout") as GridContainerItemLayoutData;
        const grid = this.byId("gridContainer") as GridContainer;
    
        let url = window.location.href + "/Laps";
        url = url.substring(url.indexOf("/Sessions"));
        url = window.location.origin + "/odata/v4/gt7" + url;
        
        const res = await fetch(url);

        if (!res.ok) {
            return;
        }
        const data = await res.json();
        
        // load select entries
        lapSelect.removeAllItems();
        for (const lap of data.value) {
            const item = new Item({
                key: lap.lap.toString(),
                text: lap.lap.toString()
            });
            lapSelect.addItem(item);
        }
        
        // set layout rows based on nb laps
        lapsTimesLayout.setMinRows(data.value.length / 2);
        speedPerLapLayout.setMinRows(data.value.length / 2);

        grid.rerender();
    }

    private async loadLapSVG(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const trackMap = this.byId("trackTrajectoryImage") as Image;

        let url = window.location.href + "/trackUrl?lap=0";
        url = url.substring(url.indexOf("/Sessions"));
        url = window.location.origin + "/odata/v4/gt7" + url;

        trackMap.setSrc(url);

        const imageObject = this.byId("trackImage") as Image;
        url = window.location.href + "/trackUrl?lap=1&raceData=velocity";
        url = url.substring(url.indexOf("/Sessions"));
        url = window.location.origin + "/odata/v4/gt7" + url;

        imageObject.setSrc(url);
    }

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf raceanalysis.ext.view.SessionObjectPage
     */
    // public  onBeforeRendering(): void {
    //
    //  }

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf raceanalysis.ext.view.SessionObjectPage
     */
    // public  onAfterRendering(): void {
    //
    // }

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf raceanalysis.ext.view.SessionObjectPage
     */
    // public onExit(): void {
    //
    //  }

    onTrackGraphPress(oEvent: any): void {
        const selectedLap = this.byId("lapSelect") as Select;
        const selectedData = this.byId("racedataSelect") as Select;

        const lap = selectedLap.getSelectedKey();
        const data = selectedData.getSelectedKey();

        const imageObject = this.byId("trackImage") as Image;
        let url = window.location.href + "/trackUrl?lap=" + lap + "&raceData=" + data;
        url = url.substring(url.indexOf("/Sessions"));
        url = window.location.origin + "/odata/v4/gt7" + url;

        imageObject.setSrc(url);
    }

    public async  onGenerateMetricsPress(): Promise<void> {
        // Get the OData V4 Model from the view
        let url = window.location.href + "/generateFioriMetrics()";
        url = url.substring(url.indexOf("/Sessions"));
        url = window.location.origin + "/odata/v4/gt7" + url;

        await fetch(url, {
        }).then(response => {
            if (response.ok) {
                this.loadLapData();
                this.loadLapSVG();
                // MessageToast.show("Metrics generated successfully");
            } else {
                // MessageToast.show("Failed to generate metrics");
            }
        });
    }
}