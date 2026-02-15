# Pi Coding Agent
- Reference: https://github.com/badlogic/pi-mono

# Overview
- `prompts`: reusable markdown templates (invoked with `/name`)
- `skills`: on-demand capabilities containing instructions and tools (loaded with `/skill:name`)
- `extensions`: TypeScript modules that extend Pi with custom tools, commands, shortcuts, event handlers and UI components 

# Setup
### 1. Install `pi-coding-agent`
- See [Doc](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent)

```bash
npm install -g @mariozechner/pi-coding-agent
```

### 2. Connect Provider
- See [Doc](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/providers.md)
- I am using self hosted ollama
- Edit global `~/.pi/agent/models.json`

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "models": [
        { "id": "gpt-oss:20b" }
      ]
    }
  }
}
```

### 3. Start
```bash
pi
```

