terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

# Külön Docker network a monitoring stacknek
resource "docker_network" "monitoring" {
  name = "monitoring-net"
}

# cAdvisor – konténerszintű metrikák
resource "docker_container" "cadvisor" {
  name  = "cadvisor"
  image = "gcr.io/cadvisor/cadvisor:latest"

  ports {
    internal = 8080
    external = 8081
  }

  volumes {
    host_path      = "/"
    container_path = "/rootfs"
    read_only      = true
  }

  volumes {
    host_path      = "/var/run"
    container_path = "/var/run"
    read_only      = true
  }

  volumes {
    host_path      = "/sys"
    container_path = "/sys"
    read_only      = true
  }

  volumes {
    host_path      = "/var/lib/docker"
    container_path = "/var/lib/docker"
    read_only      = true
  }

  networks_advanced {
    name = docker_network.monitoring.name
  }
}

# Prometheus – méri a cAdvisor-t
resource "docker_container" "prometheus" {
  name  = "prometheus"
  image = "prom/prometheus:latest"

  ports {
    internal = 9090
    external = 9090
  }

  volumes {
    host_path      = abspath("${path.module}/prometheus.yml")
    container_path = "/etc/prometheus/prometheus.yml"
    read_only      = true
  }

  networks_advanced {
    name = docker_network.monitoring.name
  }
}

# Grafana – dashboard
resource "docker_container" "grafana" {
  name  = "grafana"
  image = "grafana/grafana-oss:latest"

  ports {
    internal = 3000
    external = 3100
  }

  networks_advanced {
    name = docker_network.monitoring.name
  }
}
