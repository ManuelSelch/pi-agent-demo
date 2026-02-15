import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function myExtension(pi: ExtensionAPI) {
  pi.registerCommand("hello-world", {
    description: "Prints 'hello' to the terminal",
    handler: async (_args, ctx) => {
      ctx.ui.notify("hello world", "info");
    },
  });
}
