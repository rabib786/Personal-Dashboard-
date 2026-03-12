import re

with open('style.css', 'r') as f:
    content = f.read()

# Replace transition times in all transition properties.
# Be careful not to replace transitions for specific properties we don't want to change if they exist, but the prompt says:
# "Update all existing .card and button hover states to pull from these new variables instead of hardcoded transition times."

# Let's inspect buttons and cards first
