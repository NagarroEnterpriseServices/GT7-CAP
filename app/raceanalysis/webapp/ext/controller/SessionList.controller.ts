import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import Dialog from "sap/m/Dialog";
import {DialogType, ButtonType} from "sap/m/library";
import Button from "sap/m/Button";
import Text from "sap/m/Text";
import MessageToast from "sap/m/MessageToast";
import VBox from "sap/m/VBox";
import Input from "sap/m/Input";

export default ControllerExtension.extend("raceanalysis.ext.controller.SessionList", {
    override: {
        routing: {
            onBeforeNavigation: async function (mNavigationParameters: any) {
                const oBindingContext = mNavigationParameters.bindingContext;

                var inputValue = "";
                
                const askUser = (): Promise<boolean> => {
                    return new Promise((fnResolve) => {
                        const onSubmit = async(oEvent : any) =>{
                            const driver = inputValue;
                            const id = oBindingContext.getProperty("ID");
                            var url = "/odata/v4/gt7/Sessions(" + id + ")/assignDriver";
                            url = window.location.origin + url;

                            const res = await fetch(url, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    sessionID: id,
                                    driver: driver
                                })
                            });

                            if (res.ok) {
                                MessageToast.show("Driver assigned successfully");
                                oApproveDialog.close();
                                fnResolve(true);
                            } else {
                                MessageToast.show("Error assigning driver");
                                oApproveDialog.close();
                                fnResolve(false);
                            }
                        };

                        const oApproveDialog = new Dialog({
                            type: DialogType.Message,
                            title: "No driver assigned",
                            content: new VBox({
                                items: [
                                    new Text({
                                        text: "Who is the driver of this session?"
                                    }),
                                    // Add input field here
                                    new Input({
                                        placeholder: "Driver",
                                        value: "",
                                        submit: onSubmit,
                                        liveChange: function (oEvent) {
                                            inputValue = oEvent.getParameter("value") as string;
                                        }
                                    })
                                ]
                            }),
                            beginButton: new Button({
                                type: ButtonType.Emphasized,
                                text: "Assign driver",
                                press: onSubmit
                            }),
                            endButton: new Button({
                                text: "Not now",
                                press: function () {
                                    oApproveDialog.close();
                                    fnResolve(false);
                                }
                            })
                        });
                        oApproveDialog.open();
                    });
                };
                const id = oBindingContext.getProperty("ID");
                var url = "/odata/v4/gt7/Sessions(" + id + ")?$select=driver";
                url = window.location.origin + url;

                const res = await fetch(url);
                const data = await res.json();


                if (data.driver === null) {
                askUser().then((result) => {
                    if (result) {
                        this.base.getExtensionAPI().routing.navigate(oBindingContext);
                    }
                });
            } else {
                this.base.getExtensionAPI().routing.navigate(oBindingContext);
            }
                return true; // Prevent default routing behavior

                // } else {
                //     return false; // Continue with default routing behavior
                // }
            }
        }
    },
});