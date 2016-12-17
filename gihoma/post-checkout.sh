#!/usr/bin/env sh

# Remove installed packages that are not in package.json.
npm prune

# Install missing and update existing packages.
npm update
