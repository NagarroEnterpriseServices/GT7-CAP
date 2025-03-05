import Controller from "sap/ui/core/mvc/Controller";
import Formatter from "../model/formatter";
import Component from "racedash/Component";
import { getCloudEvent } from "racedash/service/WebSocketService";
import Input from "sap/m/Input";
import Dialog from "sap/m/Dialog";
import Button from "sap/m/Button";

/**
 * @namespace racedash.controller
 */
export default class Dashboard extends Controller {

    // formatter
    formatter: Formatter = new Formatter();

    /*eslint-disable @typescript-eslint/no-empty-function*/
    async onInit(): Promise<void> { }

    handleDriver() {
        // Get the component and WebSocket model
        const appComponent = this.getOwnerComponent() as Component;
        const ws = appComponent.webSocketService.ws;
        const wsModel = appComponent.webSocketService.model;

        // Create the input field for the driver name
        const oInput = new Input({
            value: "{ws>/driver}",
            placeholder: "Enter Driver's Name"
        });

        // Create the dialog
        const oDialog = new Dialog({
            title: "Assign Driver",
            content: [oInput],
            beginButton: new Button({
                text: "OK",
                press: function () {
                    // Get the driver name from the input
                    const sDriverName = oInput.getValue();

                    // Set the driver value in the model
                    wsModel.setProperty("/driver", sDriverName);

                    // Send a WebSocket event to update the driver
                    if (ws) {
                        ws.send(JSON.stringify(
                            getCloudEvent("driver", { driver: sDriverName })
                        ));
                    }

                    // Close the dialog
                    oDialog.close();
                }
            }),
            endButton: new Button({
                text: "Cancel",
                press: function () {
                    // Close the dialog without doing anything
                    oDialog.close();
                }
            })
        });

        // Open the dialog
        oDialog.open();
    }

    handleRecord() {
        // Get the component and WebSocket model
        const appComponent = this.getOwnerComponent() as Component;
        const ws = appComponent.webSocketService.ws;
        const wsModel = appComponent.webSocketService.model;
        const recording = wsModel.getProperty("/recording");

        // Send a WebSocket event to toggle recording state
        if (ws) {
            ws.send(JSON.stringify(
                getCloudEvent("recording", { recording: !recording })
            ));
        }
    }
}
