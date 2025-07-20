#!/bin/bash
LOG_FILE="terminal_output.log"

# Clear the log file at the beginning (optional)
> "$LOG_FILE"

# Run the desired command and tee output to file
# Replace 'your-command-here' with the actual command you run
COMMAND="npx tsx src/utils/refreshPrices.ts"
eval "$COMMAND" 2>&1 | tee -a "$LOG_FILE"