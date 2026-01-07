import Category from "../enums/Category";
import Contexts from "../enums/Contexts";

export default interface ICommandOptions {
    custom_id: string;
    title: string;
    cooldown: number;
}
