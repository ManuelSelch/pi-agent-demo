import { BashToolCallEvent, isToolCallEventType, ToolCallEvent, type ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
    pi.on("tool_call", async (event, ctx) => {
        if(!isBash(event)) return;

        if(containsSudo(event))
            return block("dangerous command, sudo is not allowed for agent" );
        
    });
}

function isBash(event: ToolCallEvent) {
    return isToolCallEventType("bash", event);
}

function containsSudo(event: BashToolCallEvent) {
    return event.input.command.includes("sudo");
}

function block(reason: string) {
    return { block: true, reason }
}