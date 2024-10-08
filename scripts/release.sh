#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

main() {
  pnpm run-s clean build check test

  local version
  version="$(git cliff --bumped-version)"

  local packageFile="./package.json"
  local changelogFile="./CHANGELOG.md"

  echo "Updating '$packageFile'"
  jq \
    --arg version "${version##*v}" \
    '.version = $version' \
    $packageFile |\
    sponge $packageFile

  echo "Updating '$changelogFile'"
  git cliff --bump --output $changelogFile

  echo "Creating release commit and tag"
  git add $packageFile $changelogFile
  git commit -m "chore(release): create release $version"
  git tag "$version"
}

cd "$SCRIPT_DIR/.."
main "$@"
