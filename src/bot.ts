import { Swaggify } from "@custom/PrettyConsole";
import CustomClient from "./base/classes/CustomClient";
import { configDotenv } from "dotenv";

configDotenv();
new Swaggify();

(new CustomClient).Init();
