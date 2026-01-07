export default interface IHandler {
    LoadEvents(): void;
    LoadModals(): void;
    LoadCommands(): void;
    LoadDatabases(): void;
    LoadComponentInteractions(): void;
}
