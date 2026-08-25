export interface RunBuildOptions {
    Tasks?: string;
    BuildOptions?: string;
}
export declare function generateCommand(options: RunBuildOptions): string;
