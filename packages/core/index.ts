import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { makeInstaller } from "@zs-base-ui/utils";
import components from "./components";
import "element-plus/theme-chalk/index.css";

library.add(fas);

const installer = makeInstaller(components);

export * from "@zs-base-ui/components";
export default installer;
