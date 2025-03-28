# IoT Data Standards

![Matogen Logo](https://v1.test.app.cypherview.net/assets/images/logo.svg)

## Overview

This repository serves as the central source of truth for IoT telemetry data standards. It provides standardized data models, schemas, and interfaces that enable seamless integration between various IoT devices, drivers, and services.

## Purpose

The IoT Data Standards repository aims to:
- Establish consistent data formats across different telemetry devices
- Simplify integration between drivers and services
- Ensure data interoperability across the IoT ecosystem
- Reduce development time and maintenance costs
- Enable plug-and-play functionality for new devices

## Key Features

- Standardized data models for common IoT devices
- Well-defined schemas for telemetry data
- Clear interface specifications
- Version-controlled standards
- Comprehensive documentation

## Getting Started

### Prerequisites
- Basic understanding of IoT concepts
- Familiarity with data modeling
- Access to the repository

### Installation
```bash
git clone https://bitbucket.org/matogen/iot-data-standards
```

## Usage

1. Browse the standards in the root directory
2. Review the documentation for your specific use case
3. Implement the standards in your drivers or services
4. Follow the versioning guidelines for updates

## Repository Structure

Each device manufacturer has its own directory containing:
- `protocol-mapping.json`: Maps device identifiers to protocol definitions
- Protocol definition files (e.g., `basic-protocol.json`): Define the structure and properties for specific protocols

## Validation

The repository includes automated validation to ensure that all protocol mappings reference valid protocol files. This validation runs automatically in the CI/CD pipeline for all pull requests.

To validate locally:
```bash
./validate-protocols.sh
```

This script:
- Scans all directories for protocol mapping files
- Ensures that each referenced protocol has a corresponding JSON file
- Checks that all JSON files are valid
- Warns about protocol files that aren't referenced in the mapping