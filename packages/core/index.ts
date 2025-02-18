import { makeInstaller } from "@zs-element/utils";
import components from "./components";
import "@zs-element/theme/index.css";
const installer = makeInstaller(components);

export * from "@zs-element/components";
export default installer;
