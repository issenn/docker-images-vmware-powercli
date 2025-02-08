variable "CACHEBUST" {
  default = 0
}

group "default" {
  targets = [
    "main",
    // "other",
    // "darwin",
  ]
}

target "main" {
  dockerfile = "Dockerfile"
  platforms = [
    // "linux/386",
    "linux/amd64",
    // "linux/arm/v6",
    // "linux/arm/v7",
    // "linux/arm64",
    // "linux/mips64",
    // "linux/mips64le",
    // "linux/ppc64le",
    // "linux/s390x",
    // "linux/riscv64",
  ]
  args = {
    CACHEBUST = "https://api.github.com/repos/issenn/docker-images-vmware-powercli/git/refs/heads/master"
  }
}

target "darwin" {
  platforms = [
    "darwin/amd64",
    // "darwin/arm",
    "darwin/arm64",
  ]
  inherits = [
    "main"
  ]
}

target "other" {
  platforms = [
    // "linux/arm",
    // "linux/arm64/v8",
    "linux/mips",
    "linux/mipsle",
    "linux/ppc64",
  ]
  inherits = [
    "main"
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
