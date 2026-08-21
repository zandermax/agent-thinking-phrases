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
