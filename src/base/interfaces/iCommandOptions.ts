import Category from "../enums/Category";

export default interface ICommandOptions {
    name: string;
    description: string;
    category: Category;
    options: object;
    default_member_permissions: bigint;
    global_permission: boolean;
    cooldown: number;
    dev: boolean;
    ephemeral: boolean;
}
