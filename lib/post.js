// Copyright 2026 The MathWorks, Inc.
import * as core from "@actions/core";
import { saveCache } from "./cache.js";
/**
 * Post-action entry point. Runs after the build to save the .buildtool cache
 * when appropriate. Cache failures must not fail the job.
 */
async function post() {
    await saveCache();
}
post().catch((e) => {
    core.warning(`Failed to save the cache: ${e}`);
});
//# sourceMappingURL=post.js.map