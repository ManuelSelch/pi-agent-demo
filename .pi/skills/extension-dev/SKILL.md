---
name: extension-dev
description: This skill provides comprehensive guidance for creating, modifying, and debugging extensions for the Pi coding agent. Extensions are the primary way to extend Pi's functionality with custom tools, commands, UI components, and event handlers.
---

# Pi Agent Extension Development Skill

## Overview

This skill provides comprehensive guidance for creating, modifying, and debugging TypeScript extensions for the Pi coding agent. Extensions are the primary way to extend Pi's functionality with custom tools, commands, UI components, and event handlers.

---

## When to Use This Skill

- Creating new Pi extensions from scratch
- Modifying or debugging existing extensions
- Adding custom tools that the agent can use
- Implementing custom slash commands
- Creating event handlers for the agent lifecycle
- Building custom UI components or overlays
- Working with the Pi Agent API

---

## Extension Fundamentals

### Basic Extension Structure

Every Pi extension is a TypeScript module that exports a default function accepting an `ExtensionAPI` parameter:

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function myExtension(pi: ExtensionAPI) {
    // Extension code here
    // Can register tools, commands, event handlers, etc.
}
```

### File Locations

Extensions are auto-loaded from these locations (in order of precedence):
1. `~/.pi/agent/extensions/` - Global user extensions
2. `.pi/extensions/` - Project-specific extensions
3. Pi packages installed via `pi install`


### TypeScript and Dependencies

- **Runtime compilation**: Extensions use jiti for runtime TypeScript compilation (no build step needed)
- **Node.js built-ins**: Available (e.g., `node:fs`, `node:path`)
- **npm dependencies**: Work automatically if you have a `package.json` with `node_modules/` in the extension directory or parent directories
- **Pi API imports**: Import from `@mariozechner/pi-coding-agent`
- **Schema validation**: Use `@sinclair/typebox` for parameter schemas

---

## Core API Patterns

### 1. Register Custom Tools

Tools are functions the LLM can call. Always use TypeBox for parameter schemas:

```typescript
import { Type } from "@sinclair/typebox";

pi.registerTool({
    name: "my_tool",
    label: "My Tool", // Display name
    description: "What this tool does (visible to LLM)",
    parameters: Type.Object({
        arg1: Type.String({ description: "Purpose of arg1" }),
        arg2: Type.Number({ description: "Purpose of arg2", default: 10 }),
        choice: Type.Union([
            Type.Literal("option1"),
            Type.Literal("option2")
        ], { description: "Must be option1 or option2" })
    }),
    async execute(toolCallId, params, onUpdate, ctx, signal) {
        // toolCallId: Unique ID for this tool call
        // params: Validated parameters matching schema
        // onUpdate: Function to stream incremental updates
        // ctx: Context object (ui, cwd, sessionManager, etc.)
        // signal: AbortSignal for cancellation
        
        // Stream progress (optional)
        onUpdate([{ type: "text", text: "Working..." }]);
        
        // Do work here
        const result = doSomething(params.arg1, params.arg2);
        
        // Return final result
        return {
            content: [{ type: "text", text: result }],
            details: {} // Optional metadata
        };
    }
});
```

**Important notes for tools:**
- Use `Type.Union([Type.Literal("a"), Type.Literal("b")])` for string enums (required for Google API compatibility)
- Provide clear descriptions - the LLM uses these to decide when to call tools
- Use `onUpdate()` for streaming progress to show intermediate results
- Check `signal.aborted` for long-running operations
- Return `{ content, details }` object format

### 2. Register Slash Commands

Commands are user-invoked via `/commandname` in the chat:

```typescript
pi.registerCommand("mycommand", {
    description: "What this command does",
    getArgumentCompletions: (prefix) => {
        // Optional: Provide tab-completion for arguments
        const options = ["option1", "option2", "option3"];
        return options
            .filter(o => o.startsWith(prefix))
            .map(o => ({ value: o, label: o }));
    },
    handler: async (args, ctx) => {
        // args: String argument after command name
        // ctx: Context object
        
        // Show notification
        ctx.ui.notify("Command executed!", "info");
        
        // Or show custom UI
        const choice = await ctx.ui.select(
            "Choose option",
            ["Option A", "Option B", "Option C"]
        );
        
        // Can also send messages to the agent
        ctx.sendUserMessage("Do something based on the command");
    }
});
```

### 3. Event Handlers

Hook into the agent lifecycle to observe or modify behavior:

```typescript
// Intercept tool calls before execution
pi.on("tool_call", async (event, ctx) => {
    // event.toolName: Name of tool being called
    // event.input: Tool parameters
    
    // Example: Block dangerous commands
    if (event.toolName === "bash" && event.input.command?.includes("rm -rf")) {
        const ok = await ctx.ui.confirm("Dangerous!", "Allow rm -rf?");
        if (!ok) {
            return { block: true, reason: "User denied permission" };
        }
    }
    
    // Return nothing to allow execution
});

// Modify tool results after execution
pi.on("tool_result", async (event, ctx) => {
    // event.toolName: Name of tool that executed
    // event.result: Tool return value
    
    // Example: Filter sensitive data from results
    if (event.toolName === "bash" && event.result.content) {
        const filtered = filterSecrets(event.result.content);
        return { content: filtered };
    }
});

// Intercept user input before it reaches the agent
pi.on("input", async (event, ctx) => {
    // event.text: Raw user input
    // event.images: Attached images
    // event.source: "interactive", "rpc", or "extension"
    
    // Transform input
    if (event.text.startsWith("?")) {
        return {
            action: "transform",
            text: `Respond briefly: ${event.text.slice(1)}`
        };
    }
    
    // Handle without LLM (bypass agent processing)
    if (event.text === "ping") {
        ctx.ui.notify("pong!", "info");
        return { action: "handled" };
    }
    
    // Continue normally
    return { action: "continue" };
});

// Modify context before each LLM turn
pi.on("context", async (event, ctx) => {
    // event.messages: Current message history
    // event.systemPrompt: System prompt
    
    // Example: Inject additional context
    return {
        messages: [
            ...event.messages,
            { role: "user", content: "Remember: always use TypeScript" }
        ]
    };
});

// Session lifecycle events
pi.on("session_start", async (event, ctx) => {
    // Runs when a new session starts
    ctx.ui.notify("Session started", "info");
});

pi.on("session_switch", async (event, ctx) => {
    // event.from: Previous session ID
    // event.to: New session ID
});

pi.on("agent_start", async (event, ctx) => {
    // Agent starting to process a request
});

pi.on("agent_end", async (event, ctx) => {
    // Agent finished processing
});
```

**Complete Event Lifecycle:**
```
pi starts
└─► session_start
    │
    ▼ user sends prompt
    ├─► input (can intercept/transform)
    ├─► before_agent_start (can inject message/modify system prompt)
    ├─► agent_start
    │   │
    │   ┌─── turn (repeats while LLM calls tools) ───┐
    │   │   ├─► turn_start                           │
    │   │   ├─► context (can modify messages)        │
    │   │   │                                         │
    │   │   │ LLM responds, may call tools:          │
    │   │   │   ├─► tool_call (can block)            │
    │   │   │   │   tool executes                    │
    │   │   │   └─► tool_result (can modify)         │
    │   │   │                                         │
    │   │   └─► turn_end                              │
    │   │                                             │
    │   └───────────────────────────────────────────┘
    │
    └─► agent_end
```

### 4. Context Object (ctx)

The context object provides access to Pi's functionality:

```typescript
// UI methods (only available in interactive mode)
ctx.ui.notify(message: string, level: "info" | "success" | "warning" | "error")
ctx.ui.confirm(title: string, message: string): Promise<boolean>
ctx.ui.select(title: string, options: string[]): Promise<string | undefined>
ctx.ui.input(title: string, defaultValue?: string): Promise<string | undefined>
ctx.ui.editor(title: string, content: string, language?: string): Promise<string | undefined>
ctx.ui.setStatus(text: string) // Set footer status text
ctx.ui.setTitle(text: string) // Set window title

// Check if UI is available (false in print/json/rpc modes)
if (ctx.hasUI) {
    // Use UI methods
}

// Current working directory
ctx.cwd: string

// Session management
ctx.sessionManager.getEntries() // All session entries
ctx.sessionManager.getBranch() // Current branch
ctx.sessionManager.getLeafId() // Current leaf entry ID

// Send messages to the agent
ctx.sendUserMessage(text: string, images?: ImageAttachment[])

// Access to models and settings
ctx.modelRegistry // Available models
ctx.settings // Current settings

// Request graceful shutdown
ctx.shutdown()
```

### 5. Register Keyboard Shortcuts

```typescript
pi.registerShortcut("ctrl+g", {
    description: "My custom action",
    handler: async (ctx) => {
        ctx.ui.notify("Shortcut triggered!", "info");
    }
});
```

---

## Best Practices for Extension Development

### 1. Reading Files First

**Always read existing extension files before modifying them:**

```typescript
// WRONG: Modifying blindly
export default function(pi: ExtensionAPI) {
    // Adding code without understanding structure
}

// RIGHT: Read first, understand structure, then modify
// 1. Use view tool to read the extension file
// 2. Understand its current structure and patterns
// 3. Make changes that match the existing style
// 4. Preserve existing functionality unless explicitly asked to remove
```

### 2. Error Handling

Extensions should handle errors gracefully:

```typescript
pi.registerTool({
    name: "example",
    // ...
    async execute(toolCallId, params, onUpdate, ctx, signal) {
        try {
            // Tool logic
            const result = await doSomething();
            return { content: [{ type: "text", text: result }] };
        } catch (error) {
            // Return error in expected format
            return {
                content: [{
                    type: "text",
                    text: `Error: ${error.message}`
                }],
                isError: true
            };
        }
    }
});
```

### 3. TypeScript Types

Always import and use proper types:

```typescript
import type {
    ExtensionAPI,
    ToolContext,
    SlashCommandHandler,
    EventHandler
} from "@mariozechner/pi-coding-agent";
```

### 4. Parameter Validation

Use TypeBox schemas for robust validation:

```typescript
import { Type } from "@sinclair/typebox";

// Good parameter schema
parameters: Type.Object({
    path: Type.String({ 
        description: "Path to file",
        minLength: 1
    }),
    overwrite: Type.Boolean({ 
        description: "Overwrite if exists",
        default: false 
    }),
    mode: Type.Union([
        Type.Literal("read"),
        Type.Literal("write"),
        Type.Literal("append")
    ], { description: "File access mode" })
})
```

### 5. Testing Extensions

Test your extension incrementally:

```bash
# Test without installing
pi --extension ./my-extension.ts

# Test specific functionality
# - Try calling custom tools
# - Try slash commands
# - Check event handlers trigger correctly
```

### 6. Documentation

Document your extension with clear comments:

```typescript
/**
 * My Extension
 * 
 * Description of what this extension does.
 * 
 * Usage:
 * - /mycommand <args> - Does something
 * - Tool: my_tool - Called by LLM to do something
 * 
 * Configuration:
 * - Set ENV_VAR for custom behavior
 */
export default function myExtension(pi: ExtensionAPI) {
    // Implementation
}
```

---

## Common Patterns

### Pattern 1: Permission Gates

```typescript
pi.on("tool_call", async (event, ctx) => {
    const dangerous = ["rm -rf", "dd if=", "mkfs", "> /dev/"];
    
    if (event.toolName === "bash") {
        const cmd = event.input.command || "";
        const isDangerous = dangerous.some(pattern => cmd.includes(pattern));
        
        if (isDangerous) {
            const ok = await ctx.ui.confirm(
                "Dangerous Command",
                `Execute: ${cmd}?`
            );
            if (!ok) {
                return { block: true, reason: "Blocked by user" };
            }
        }
    }
});
```

### Pattern 2: Auto-Git Commits

```typescript
pi.on("tool_result", async (event, ctx) => {
    if (event.toolName === "write" || event.toolName === "edit") {
        const path = event.input.path;
        if (path && !path.includes("node_modules")) {
            // Auto-commit changes
            const { execSync } = await import("node:child_process");
            try {
                execSync(`git add "${path}"`, { cwd: ctx.cwd });
                execSync(`git commit -m "Auto: modified ${path}"`, { 
                    cwd: ctx.cwd 
                });
            } catch {
                // Ignore git errors
            }
        }
    }
});
```

### Pattern 3: Context Injection

```typescript
pi.on("context", async (event, ctx) => {
    // Inject project-specific context
    const projectInfo = {
        framework: "React",
        typescript: true,
        testFramework: "vitest"
    };
    
    return {
        messages: [
            ...event.messages,
            {
                role: "user",
                content: `Project uses: ${JSON.stringify(projectInfo)}`
            }
        ]
    };
});
```

### Pattern 4: Custom Status Display

```typescript
pi.on("agent_start", async (event, ctx) => {
    ctx.ui.setStatus("🤖 Agent thinking...");
});

pi.on("agent_end", async (event, ctx) => {
    ctx.ui.setStatus("✅ Ready");
});

pi.on("tool_call", async (event, ctx) => {
    ctx.ui.setStatus(`⚙️ Using ${event.toolName}...`);
});
```

---

## Debugging Extensions

### Enable Debug Output

```bash
# Run with debug output
DEBUG=pi:* pi

# Or specific namespaces
DEBUG=pi:extensions pi
```

### Common Issues and Solutions

**Issue: Extension not loading**
- Check file is in correct location (`~/.pi/agent/extensions/` or `.pi/extensions/`)
- Verify TypeScript syntax is valid
- Check for import errors
- Look for extension errors in startup output

**Issue: Tool not appearing for LLM**
- Ensure tool name doesn't conflict with built-in tools
- Check `description` is clear and specific
- Verify parameter schema is valid TypeBox
- Tool must be registered before session starts

**Issue: UI methods don't work**
- Check `ctx.hasUI` before using UI methods
- UI only works in interactive mode, not print/json/rpc modes
- Use try-catch around UI calls

**Issue: Event handler not triggering**
- Verify event name is correct (see lifecycle diagram)
- Check handler is registered synchronously in extension function
- Look for errors in handler execution (logged to console)

### Testing Checklist

- [ ] Extension loads without errors
- [ ] Custom tools appear in tool list
- [ ] Slash commands work and show in autocomplete
- [ ] Event handlers trigger at correct times
- [ ] UI interactions work properly
- [ ] Error handling works (try invalid inputs)
- [ ] TypeScript types are correct (no `any`)
- [ ] Works in different modes (interactive, print, rpc if applicable)

---

## Extension Modification Workflow

When asked to modify an existing extension:

1. **Read the current file**
   ```bash
   # Use view tool to read the extension
   view ~/.pi/agent/extensions/my-extension.ts
   ```

2. **Understand the structure**
   - Identify existing tools, commands, event handlers
   - Note the coding style and patterns used
   - Check for dependencies and imports

3. **Plan changes**
   - Determine what needs to be added/modified/removed
   - Ensure changes won't break existing functionality
   - Consider impact on other parts of extension

4. **Make incremental changes**
   - Use `str_replace` for surgical edits
   - Make one logical change at a time
   - Preserve existing code style and patterns

5. **Test the changes**
   ```bash
   # Test modified extension
   pi --extension ~/.pi/agent/extensions/my-extension.ts
   ```

6. **Verify functionality**
   - Test all modified features
   - Verify existing features still work
   - Check for TypeScript errors: `npx tsc --noEmit my-extension.ts`

---

## Advanced Patterns

### Custom UI Components

```typescript
pi.on("session_start", async (event, ctx) => {
    // Add custom widget above editor
    ctx.ui.setWidget({
        position: "above_editor",
        render: (tui, theme) => {
            return {
                content: "Custom widget content",
                height: 2
            };
        }
    });
});
```

### Streaming Tool Results

```typescript
pi.registerTool({
    name: "stream_example",
    // ...
    async execute(toolCallId, params, onUpdate, ctx, signal) {
        // Stream incremental updates
        onUpdate([{ type: "text", text: "Starting...\n" }]);
        
        for (let i = 0; i < 10; i++) {
            if (signal.aborted) break;
            
            await new Promise(r => setTimeout(r, 100));
            onUpdate([{ type: "text", text: `Progress: ${i}\n` }]);
        }
        
        // Final result
        return {
            content: [{ type: "text", text: "Complete!" }]
        };
    }
});
```

### Dynamic Tool Registration

```typescript
export default function(pi: ExtensionAPI) {
    // Load tools dynamically based on environment
    const tools = loadToolsFromConfig();
    
    for (const tool of tools) {
        pi.registerTool(tool);
    }
}
```

---

## Integration with Ollama Models

When using Ollama models like gpt-oss:20b:

1. **Lower temperature for code generation** - Set temperature to 0.1-0.3 in models.json
2. **Provide clear tool descriptions** - Smaller models benefit from explicit descriptions
3. **Use simple parameter schemas** - Avoid deeply nested or complex schemas
4. **Test tool calls explicitly** - Verify Ollama model can properly call your tools
5. **Consider model limitations** - Smaller models may struggle with complex multi-step tasks

---

## Resources

- Official docs: `~/.pi/agent/docs/extensions.md` (read from Pi mono repo)
- Example extensions: `~/.pi/agent/examples/extensions/`
- Pi packages: Search npm for "pi-package" keyword
- Community: Pi Agent Discord server

---

## Quick Reference

### Extension Template

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

export default function myExtension(pi: ExtensionAPI) {
    // Register tool
    pi.registerTool({
        name: "my_tool",
        label: "My Tool",
        description: "Tool description",
        parameters: Type.Object({
            arg: Type.String({ description: "Argument" })
        }),
        async execute(toolCallId, params, onUpdate, ctx, signal) {
            return {
                content: [{ type: "text", text: "Result" }]
            };
        }
    });
    
    // Register command
    pi.registerCommand("mycmd", {
        description: "Command description",
        handler: async (args, ctx) => {
            ctx.ui.notify("Done!", "info");
        }
    });
    
    // Register event handler
    pi.on("tool_call", async (event, ctx) => {
        // Handle event
    });
}
```

### Common Imports

```typescript
import type {
    ExtensionAPI,
    ToolContext,
    SlashCommandHandler,
    EventHandler,
    CustomEditor
} from "@mariozechner/pi-coding-agent";

import { Type } from "@sinclair/typebox";
import { matchesKey } from "@mariozechner/pi-tui";
```

---

## Summary

- **Read first**: Always read existing extensions before modifying
- **Test incrementally**: Test each change as you make it
- **Handle errors**: Use try-catch and return proper error format
- **Document clearly**: Add comments and descriptions
- **Follow patterns**: Match existing code style and patterns
- **Use types**: Import and use proper TypeScript types
- **Validate parameters**: Use TypeBox schemas for all tool parameters
- **Check UI availability**: Use `ctx.hasUI` before UI methods
- **Consider modes**: Extensions run in interactive, print, json, and rpc modes