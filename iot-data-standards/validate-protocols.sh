#!/bin/bash

# Script to validate that protocol mappings reference existing protocol files
# Designed to run in Bitbucket Pipelines to block PRs with invalid mappings
# Will scan all device folders for protocol mappings

set -e

echo "Validating protocol mappings against available protocol files..."

REPO_ROOT="$(pwd)"
# Track validation status
VALIDATION_PASSED=true

# Find all protocol-mapping.json files in the repository
MAPPING_FILES=$(find "$REPO_ROOT" -name "protocol-mapping.json")

if [ -z "$MAPPING_FILES" ]; then
  echo "ERROR: No protocol-mapping.json files found in the repository"
  exit 1
fi

# Process each mapping file
for MAPPING_FILE in $MAPPING_FILES; do
  echo "Processing mapping file: $MAPPING_FILE"
  
  # Get the directory containing the mapping file
  DEVICE_DIR=$(dirname "$MAPPING_FILE")
  DEVICE_NAME=$(basename "$DEVICE_DIR")
  
  echo "Validating protocols for device type: $DEVICE_NAME"
  
  # Check if mapping file is valid JSON
  if ! jq empty "$MAPPING_FILE" 2>/dev/null; then
    echo "ERROR: Mapping file at ${MAPPING_FILE} is not valid JSON"
    VALIDATION_PASSED=false
    continue
  fi
  
  # Get all referenced protocols from the mapping file - handles the object format
  REFERENCED_PROTOCOLS=$(jq -r 'to_entries | map(.value) | unique | .[]' "$MAPPING_FILE")
  
  # Check each referenced protocol
  for PROTOCOL in $REFERENCED_PROTOCOLS; do
    PROTOCOL_FILE="${DEVICE_DIR}/${PROTOCOL}.json"
    
    if [ ! -f "$PROTOCOL_FILE" ]; then
      echo "ERROR: Protocol '$PROTOCOL' is referenced in mapping for $DEVICE_NAME but file does not exist at ${PROTOCOL_FILE}"
      VALIDATION_PASSED=false
    else
      # Validate that the protocol file is valid JSON
      if ! jq empty "$PROTOCOL_FILE" 2>/dev/null; then
        echo "ERROR: Protocol file at ${PROTOCOL_FILE} is not valid JSON"
        VALIDATION_PASSED=false
      else
        echo "✓ Protocol '$PROTOCOL' validation passed for $DEVICE_NAME"
      fi
    fi
  done
  
  # Verify that all .json files in the directory (except the mapping file itself) 
  # are referenced in the mapping
  JSON_FILES=$(find "$DEVICE_DIR" -name "*.json" -not -name "protocol-mapping.json" -exec basename {} \; | sed 's/\.json$//')
  
  for JSON_FILE in $JSON_FILES; do
    if ! echo "$REFERENCED_PROTOCOLS" | grep -q "^$JSON_FILE$"; then
      echo "WARNING: Protocol file '$JSON_FILE.json' exists but is not referenced in the mapping for $DEVICE_NAME"
    fi
  done
done

# If validation failed, exit with error code
if [ "$VALIDATION_PASSED" = false ]; then
  echo "❌ Protocol validation failed. Please ensure all mapped protocols exist as files."
  exit 1
else
  echo "✅ All protocol mappings reference valid protocol files!"
fi