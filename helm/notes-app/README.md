# Notes App Helm Chart

This repository contains a Helm chart for deploying a microservices-based Notes Application on Kubernetes.

## Architecture

- Frontend (UI)
- Backend (API)
- Auth Service
- MongoDB (with Persistent Volume)

## Features

- Kubernetes Deployments & Services
- Ingress for routing
- ConfigMap & Secret management
- Horizontal Pod Autoscaling (HPA)
- Helm templating for reusability

## Installation

```bash
helm install notes-app ./notes-app \
  -f values.yaml \
  -f values-secret.yaml
