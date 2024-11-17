'use strict';
import {handleInteraction} from './discord';

/**
 * Handles HTTP requests to the worker.
 * @param request Request data
 * @param env Environment data
 * @param _ctx Execution context
 * @returns Response data
 */
function fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
): Promise<Response> | Response {
    switch (new URL(request.url).pathname) {
        case '/interactions':
            return handleInteraction(request, env);
        default:
            return new Response(null, {
                headers: {
                    Location: env.DISCORD_INVITE
                },
                status: 302
            });
    }
}

export default {fetch} satisfies ExportedHandler<Env>;
