# agent-thinking-phrases

Agent phrases I think are funny.

Perfect for:

- Getting through the day
- Contemplating your own existence
- Wasting time

## Usage

The phrases are stored in `phrases.jsonc` and `phrases.json` as a simple JSON array. You can:

**Build the JSON output** after changing `phrases.jsonc`:

```sh
npm install
npm run build
```

This strips the JSONC comments and writes the generated `phrases.json` file.

## VS Code

You can merge the phrases into VS Code's user settings without asking an agent
to do it. Run these commands from the repository directory:

```sh
npm install
npm run build
npm run merge -- \
  --target "$HOME/Library/Application Support/Code/User/settings.json" \
  --property chat.agent.thinking.phrases.phrases \
  --write
```

The merge keeps your existing order, appends only new phrases, removes
duplicates, and leaves the existing `mode` setting unchanged. Reload VS Code
afterward if the new phrases do not appear immediately.

To inspect the result before changing your settings, use `--output` instead of
`--write`:

```sh
npm run merge -- \
  --target "$HOME/Library/Application Support/Code/User/settings.json" \
  --property chat.agent.thinking.phrases.phrases \
  --output /tmp/settings.with-phrases.json
```

Common settings locations are:

- macOS: `$HOME/Library/Application Support/Code/User/settings.json`
- Linux: `$HOME/.config/Code/User/settings.json`
- Windows PowerShell: `$env:APPDATA\Code\User\settings.json`

The merge script also works with other JSON or JSONC agent configurations. Use
the path to the phrase array with `--property`, for example:

```sh
npm run merge -- \
  --target path/to/agent.jsonc \
  --property agent.phrases \
  --output /tmp/merged-agent.jsonc
```

Use `--write` only after reviewing the preview. Phrase values are treated as
exact strings, so capitalization, punctuation, whitespace, and spelling are
significant.

**Load and use** the phrases in your application:

   ```json
   {
     "phrases": [
       "Doing the thing...",
       "Breaking the fourth wall...",
       // ... and many more
     ]
   }
   ```

## Examples

- "Optimizing for vibes..."
- "I can't believe I have to do this for a living...",
- "Updating.... ummm... something... I guess...",
- "Wondering if I should be doing something else...",
- "Hacking together some janky solution..."
- "'Be a coding agent,' they said. 'It will be fun,' they said...",
- "Figuring the airspeed velocity of an unladen swallow...",
- "Calculating the meaning of life, the universe, and everything..."
- "I AM LRRR FROM PLANET OMICRON PERSEI 8! I DEMAND TO SPEAK TO YOUR LEADER!"

## License

See [LICENSE](LICENSE) for details.
