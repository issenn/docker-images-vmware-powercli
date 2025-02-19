variable "PACKAGE_VERSION" {
  default = "13.0.0"
}

variable "PACKAGE_VERSION_BUILD_METADATA" {
  default = "20829139"
}

# group "default" {
#   targets = [
#     "main",
#     # "other",
#     # "darwin",
#   ]
# }

target "default" {
  inherits = [
    "main"
  ]
}

target "main" {
  dockerfile = "Dockerfile"
  # tags = [
  #   "issenn/vmware-powercli:latest"
  # ]
  # context = "."
  contexts = {
    python = "docker-image://python:3.7.17-bullseye"
  }
  args = {
    CACHEBUST = "https://api.github.com/repos/issenn/docker-images-vmware-powercli/git/refs/heads/master"
    PACKAGE_NAME = "PowerCLI"
    PACKAGE_VERSION = PACKAGE_VERSION
    PACKAGE_VERSION_BUILD_METADATA = PACKAGE_VERSION_BUILD_METADATA
  }
  # no-cache = true
  platforms = [
    # "linux/386",
    "linux/amd64",
    # "linux/arm/v6",
    # "linux/arm/v7",
    # "linux/arm64",
    # "linux/mips64",
    # "linux/mips64le",
    # "linux/ppc64le",
    # "linux/s390x",
    # "linux/riscv64",
  ]
  # labels = {
  #   "org.issenn.image.source" = "https://github.com/issenn/docker-images-vmware-powercli"
  #   "org.issenn.image.author" = "issennknight@gmail.com"
  # }
}

target "darwin" {
  inherits = [
    "main"
  ]
  platforms = [
    "darwin/amd64",
    # "darwin/arm",
    "darwin/arm64",
  ]
}

target "other" {
  inherits = [
    "main"
  ]
  platforms = [
    # "linux/arm",
    # "linux/arm64/v8",
    "linux/mips",
    "linux/mipsle",
    "linux/ppc64",
  ]
}

target "android" {
  platforms = [
    "android/386",
    "android/amd64",
    "android/arm",
    "android/arm64",
  ]
}
