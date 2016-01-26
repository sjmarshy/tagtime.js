import { ipcRenderer } from "electron";
import React from "react";
import ReactDOM from "react-dom";
import jsnox from "jsnox";

const d = jsnox(React);

const App = React.createClass({

    componentDidMount() {

        ipcRenderer.on("hydrate", (ev, d) => this.setState(d));
    },

    getInitialState() {

        return {
            currentInput: "",
            dateString: "",
            lastTag: "",
            id: "",
            time: 0
        };
    },

    onChangeInput(e) {

        this.setState({

            currentInput: e.target.value
        });
    },

    onSubmit(tag) {

        return () => {

            ipcRenderer.send("tag:" + this.state.id, tag);
        };
    },

    render() {

        return d("div[data-component=ping-app]",
                d("h1", this.state.dateString),
                d("h2", "What are you focusing on right now?"),
                d("div",
                    d("p", "previously used"),
                    d("p.previous", { onClick: this.onSubmit(this.state.lastTag) }, this.state.lastTag)),
                d("form", { onSubmit: this.onSubmit(this.state.currentInput )},
                    d("input", { type: "text", onChange: this.onChangeInput, value: this.state.currentInput }),
                    d("button.submit", "Submit")));
    }
});

window.onload = () => {

    ReactDOM.render(
            d(App),
            document.querySelector("#app"));
};
