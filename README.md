# agent-thinking-phrases

Agent phrases I think are funny.

Perfect for:

- Getting through the day
- Contemplating your own existence
- Wasting time

## Usage

The phrases are split by theme into `phrases/*.jsonc` files (e.g. `phrases/existential_dread.jsonc`,
`phrases/rogue_ai.jsonc`), each starting with a comment describing its theme. `phrases.json` is the
generated, combined output — don't edit it directly.

**Build the combined JSON output** after changing any file in `phrases/`:

```sh
npm install
npm run build
```

This strips the JSONC comments and writes the generated `phrases.json` file.

A pre-commit hook (via Husky) automatically sorts the `phrases` array within
each `phrases/*.jsonc` file alphabetically and re-stages any files it changes,
so you don't need to keep them sorted by hand. You can also run it manually:

```sh
npm run sort
```

`npm run merge`, `npm run merge:vscode`, `npm run replace`, and
`npm run replace:vscode` all rebuild `phrases.json` from `phrases/` first, so
it's always up to date with your latest edits.

## VS Code

You can merge the phrases into VS Code's user settings without asking an agent
to do it. Run these commands from the repository directory:

```sh
npm install
npm run merge:vscode
```

The merge keeps every existing entry and its order, appends only new phrases,
does not remove existing duplicates, and leaves the existing `mode` setting
unchanged. It reads `phrases.jsonc` directly, so it does not edit this
repository. If the VS Code setting does not exist yet, `merge:vscode` creates it
with `mode` set to `append`. Reload VS Code afterward if the new phrases do not
appear immediately.

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

To replace the target phrase array completely instead of merging, use
`replace`. It keeps unrelated settings and comments, but removes target-only
phrases and preserves the source array exactly:

```sh
npm run replace -- \
  --target path/to/agent.jsonc \
  --property agent.phrases \
  --output /tmp/agent.with-phrases.jsonc
```

Review the preview, then use `--write` to update the target in place:

```sh
npm run replace -- \
  --target path/to/agent.jsonc \
  --property agent.phrases \
  --write
```

To replace the phrases in VS Code user settings directly, run:

```sh
npm run replace:vscode
```

This uses the same settings path as `merge:vscode` and can be pointed at a
different file for testing with `VSCODE_SETTINGS_PATH`.

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
