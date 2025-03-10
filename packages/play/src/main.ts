import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import ZsElement from "zs-base-ui";
import "zs-base-ui/dist/index.css";

createApp(App).use(ZsElement).mount("#app");
